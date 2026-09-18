// BottomSheet — a sheet that owns its own height, position, drag and backdrop.
//
// Why it owns all four: every one of them has to agree about where the sheet's
// bottom edge is, and a sheet that leaves any of them to something else ends up
// describing its own box two different ways. Splitting them is what produced
// the whole family of keyboard bugs this replaces — the sheet translating on
// one timeline while its height changed on another, a drag measured against a
// box that had already moved, and a sheet growing back mid-close because the
// keyboard went away.
//
// So there is exactly one description of the box here:
//
//   height = open − keyboard               (bottom edge pinned)
//   offset = drag − keyboard               (slides out, lifts clear of the keys)
//
// Opening, dragging and the keyboard are all the same quantity — height — which
// is why a drag that interrupts an animation has nothing to disagree with.
//
// Every one of those values is a reanimated shared value, so the whole box is
// computed on the UI thread. That matters most for `height`, which is a layout
// property: RN's own Animated cannot drive layout natively, so on that driver a
// sheet with a lot of content inside it dropped the entrance animation entirely
// and simply appeared. Here the height animates in step with the transform even
// while JS is busy laying the content out.
//
// It renders in a Modal on purpose. A Modal is its own native hierarchy, so
// nothing an ancestor does to its layout — a keyboard-avoiding wrapper padding
// the page, a parent that clips — reaches the sheet. That makes this component
// the only thing moving it, which is the point.

// 1. React / RN imports
import {
  createContext,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  BackHandler,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type KeyboardEvent,
  type StyleProp,
  type ViewStyle,
  type ScrollViewProps,
} from 'react-native';

// 2. Third-party imports
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 3. Internal imports (relative)
import { useStyles } from './styles';

// 4. Types
export type BottomSheetMethods = {
  open: () => void;
  close: () => void;
};

export type BottomSheetProps = {
  /**
   * Controlled visibility. Leave it out to drive the sheet through its ref
   * instead — `open()` / `close()` — which is what the surfaces that open a
   * sheet from a callback rather than from state do.
   */
  visible?: boolean;
  /** Sheet height: a number of dp, or a percentage of `containerHeight`. */
  height: number | `${number}%`;
  /**
   * The box the percentage is taken against, and the distance the sheet slides
   * when it closes. Defaults to the window — pass the page's own measured box
   * when the UIKit is mounted under a host app's chrome, or a percentage will
   * come out taller than the page it is supposed to sit inside.
   */
  containerHeight?: number;
  /** Dark sheet surface, for sheets opened over a dark page. */
  dark?: boolean;
  /** Drag the handle down to close. */
  closeOnDragDown?: boolean;
  /** Tap the backdrop to close. */
  closeOnBackdropPress?: boolean;
  /** Extra styling for the sheet surface — a caller's own padding or colour. */
  style?: StyleProp<ViewStyle>;
  onClose?: () => void;
  children: ReactNode;
};

const OPEN_DURATION = 300;
const CLOSE_DURATION = 250;
/**
 * How far an easing carries the sheet in its opening frames scales with how
 * tall that sheet is, so a curve that is merely brisk on a short menu can be a
 * jump on a full-height one: an exponential-out moved a 700-high sheet 144 on
 * frame one and half its travel inside 50ms, against 31 on frame one for a
 * 150-high menu. This curve — the one platform sheets use — starts gently
 * enough that the first frames read as movement at any height, then decelerates
 * firmly into the end.
 */
const SHEET_EASING = Easing.bezier(0.32, 0.72, 0, 1);
/** Past this much of the sheet's height, releasing a drag closes it. */
const DRAG_CLOSE_RATIO = 0.3;
/** A flick this fast (points per second) closes the sheet whatever the distance. */
const DRAG_CLOSE_FLING = 800;
/** A drag has to travel this far before it is a drag and not a tap. */
const DRAG_ACTIVATION_DISTANCE = 8;
const BACKDROP_OPACITY = 0.32;
/** The backdrop runs this much faster than the sheet, opening and closing. */
const BACKDROP_SPEEDUP = 2.5;

/**
 * How the sheet and a scrolling body share one downward drag.
 *
 * The body registers its scroll view here and keeps the sheet posted on whether
 * it is at the top. A drag down while the list is already at the top belongs to
 * the sheet; anywhere else it belongs to the list. The two gestures are allowed
 * to run at once so the hand-off happens without lifting a finger.
 */
type ScrollCoordination = {
  scrollRef: React.RefObject<React.ComponentType<object> | null>;
  setAtTop: (atTop: boolean) => void;
};

const ScrollCoordinationContext = createContext<ScrollCoordination | null>(
  null
);

// 5. Named function component
const BottomSheetRoot = forwardRef<BottomSheetMethods, BottomSheetProps>(
  function BottomSheet(
    {
      visible,
      height,
      containerHeight,
      dark = false,
      closeOnDragDown = true,
      closeOnBackdropPress = true,
      style,
      onClose,
      children,
    },
    ref
  ) {
    const { styles } = useStyles({ dark });
    const insets = useSafeAreaInsets();
    const window = useWindowDimensions();

    const container = containerHeight ?? window.height;
    const resolvedHeight =
      typeof height === 'number'
        ? height
        : (container * parseFloat(height)) / 100;

    // `visible` is optional: when it is not given the sheet keeps its own flag
    // and the ref drives it.
    const [selfVisible, setSelfVisible] = useState(false);
    const isOpen = visible ?? selfVisible;

    // Kept mounted through the closing animation, so the sheet slides out instead
    // of vanishing the moment it is told to close.
    const [mounted, setMounted] = useState(isOpen);

    // One value for both the drag and the close: dragging moves the sheet down,
    // and closing is the same move carried all the way past the bottom edge. As
    // two separate quantities — a drag that shrank the height and a close that
    // translated — releasing a drag reset the height and the sheet flashed back
    // to full size for a frame on its way out.
    const slide = useSharedValue(0);
    // The entrance, 0 below the screen to 1 at rest. It moves the sheet rather
    // than resizing it: a sheet that grew from nothing laid its children out
    // afresh every frame, and a body built as a fixed header, a flexible middle
    // and a footer pinned to the bottom — which is how the taller sheets are
    // built — spends those frames with its middle squeezed to nothing. That
    // showed as the header arriving first above a hollow gap. Sliding a
    // finished sheet into place has no intermediate states to show, lays the
    // content out once instead of once per frame, and is what platform sheets
    // do. Height stays reserved for the keyboard, which is a single change
    // rather than an animation of its own.
    const entrance = useSharedValue(0);
    // Whether the entrance has actually begun. Between the Modal being mounted
    // and `startOpen` running there are a few frames that belong to the
    // platform: on Android the dialog window arrives under its own steam, and
    // the sheet was caught in one of them part way up the screen with no
    // backdrop behind it — a flash of the sheet, then nothing, then the real
    // entrance. The sheet is simply not drawn until it is ours to move.
    const entranceStarted = useSharedValue(0);
    const keyboardInset = useSharedValue(0);
    const backdropProgress = useSharedValue(0);

    // While the sheet is on its way out the keyboard must not resize it: the
    // dismissal that closes the sheet also dismisses the keyboard, and letting
    // that grow the sheet back is exactly the upward flash this replaces.
    const isClosing = useRef(false);

    const finishClose = useCallback(() => {
      isShown.current = false;
      setMounted(false);
      setSelfVisible(false);
      isClosing.current = false;
      onClose?.();
    }, [onClose]);

    const close = useCallback(() => {
      if (isClosing.current) return;
      isClosing.current = true;

      // The keyboard leaves with the sheet. Dismissing it here rather than
      // waiting for focus to be lost keeps the two on the same beat.
      Keyboard.dismiss();

      // The backdrop clears faster than the sheet, so the page behind is already
      // readable while the last of the sheet is still on its way out.
      backdropProgress.value = withTiming(0, {
        duration: CLOSE_DURATION / BACKDROP_SPEEDUP,
      });

      // Carries on from wherever a drag left the sheet, straight past the
      // bottom edge.
      slide.value = withTiming(
        container,
        { duration: CLOSE_DURATION, easing: SHEET_EASING },
        (completed) => {
          'worklet';
          // A close that was interrupted — the sheet reopened while it was
          // still animating out — must not run the teardown, which would
          // unmount the sheet that was just reopened and empty the content that
          // was just put in it.
          if (completed) runOnJS(finishClose)();
        }
      );

      // Nothing is reset here. `setMounted(false)` only takes effect on the next
      // render, while a shared value reaches the native view at once — so
      // resetting the slide here put the sheet back at its open position, full
      // size and over a full-strength backdrop, for the frame before the unmount
      // landed. That was the flash. The values are wound back when the sheet
      // next opens instead, where nothing can see them.
    }, [backdropProgress, container, slide, finishClose]);

    useImperativeHandle(
      ref,
      () => ({
        open: () => setSelfVisible(true),
        close: () => setSelfVisible(false),
      }),
      []
    );

    // Held until the Modal is actually on screen — see `startOpen`.
    const pendingOpen = useRef(false);
    // Whether the Modal has presented. `mounted` cannot answer that: it is
    // seeded from `isOpen`, so a sheet whose component mounts with `visible`
    // already true — which is how a sheet opened by mounting its owner behaves,
    // as opposed to one kept mounted and toggled — starts life claiming to be
    // on screen while the Modal has not even begun presenting. The entrance
    // then ran against nothing: measured at 564ms of animation spent before the
    // Modal so much as reported itself shown, which at these durations means
    // the sheet finished opening before it was ever visible and arrived with no
    // animation at all. The heavier the content the wider that gap, which is
    // why tall sheets looked like the only casualties.
    const isShown = useRef(false);

    const startOpen = useCallback(() => {
      entranceStarted.value = 1;
      entrance.value = withTiming(1, {
        duration: OPEN_DURATION,
        easing: SHEET_EASING,
      });
      backdropProgress.value = withTiming(1, {
        duration: OPEN_DURATION / BACKDROP_SPEEDUP,
      });
    }, [backdropProgress, entrance, entranceStarted]);

    // Which way this effect last acted, so it acts on the transition rather
    // than on every render it happens to be woken for. It is woken often: it
    // depends on `close`, `close` on the caller's `onClose`, and a caller
    // writing that inline hands over a new one each render. Without this, a
    // render arriving mid-entrance re-ran the open path, which winds the
    // entrance back to nothing and starts it again — the sheet appeared, snapped
    // shut and opened a second time.
    const openHandled = useRef(false);

    // Open / close from the outside.
    useEffect(() => {
      if (isOpen) {
        if (openHandled.current) return;
        openHandled.current = true;
        isClosing.current = false;
        // Wound back here, off screen, rather than at the end of the close,
        // where resetting them would repaint the sheet at its open position for
        // the frame before the unmount lands.
        slide.value = 0;
        keyboardInset.value = 0;
        // The close carries the sheet out on `slide` and never touches this, so
        // it has to be wound back by hand or the second open starts at its
        // target and plays nothing.
        entrance.value = 0;
        entranceStarted.value = 0;

        if (mounted && isShown.current) {
          // Genuinely on screen, interrupting its own close.
          startOpen();
        } else {
          // A Modal takes a while to present — longer the more there is inside
          // it — and an animation started now would spend that time off screen.
          // It waits for `onShow` instead.
          pendingOpen.current = true;
          if (!mounted) setMounted(true);
        }
      } else {
        openHandled.current = false;
        if (mounted) close();
      }
    }, [
      isOpen,
      mounted,
      close,
      entrance,
      entranceStarted,
      keyboardInset,
      slide,
      startOpen,
    ]);

    // The keyboard, on the keyboard's own curve. Reading `duration` off the
    // event is what keeps the sheet and the keyboard on one timeline rather than
    // two that happen to start together.
    useEffect(() => {
      const isIOS = Platform.OS === 'ios';
      // iOS announces the keyboard before it moves; Android only after.
      const showEvent = isIOS ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = isIOS ? 'keyboardWillHide' : 'keyboardDidHide';
      // iOS measures the keyboard from the bottom of the screen, home indicator
      // included. Android measures it from the top of the navigation bar even
      // though the keyboard is drawn over that bar, so it reads short by the
      // inset and leaves the sheet's last row under the keys.
      const bottomEdgeCorrection = isIOS ? 0 : insets.bottom;

      const animateTo = (toValue: number, event?: KeyboardEvent) => {
        keyboardInset.value = withTiming(toValue, {
          duration: event?.duration || OPEN_DURATION,
          easing: SHEET_EASING,
        });
      };

      const show = Keyboard.addListener(showEvent, (event) => {
        if (isClosing.current) return;
        animateTo(event.endCoordinates.height + bottomEdgeCorrection, event);
      });
      const hide = Keyboard.addListener(hideEvent, (event) => {
        if (isClosing.current) return;
        animateTo(0, event);
      });

      return () => {
        show.remove();
        hide.remove();
      };
    }, [insets.bottom, keyboardInset]);

    // Android's hardware back closes the sheet rather than the screen behind it.
    useEffect(() => {
      if (!mounted) return undefined;
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          close();
          return true;
        }
      );
      return () => subscription.remove();
    }, [mounted, close]);

    // The gesture lives in react-native-gesture-handler, not in RN's responder
    // system. The responder system hands a touch to exactly one view and settles
    // that at touch-down, so a drag begun on a button or inside a list is that
    // view's for good and the sheet is never consulted again — measured, not
    // assumed. Gesture handler negotiates continuously instead, which is what
    // lets a drag start anywhere on the sheet and still reach the sheet.
    const scrollRef = useRef<React.ComponentType<object> | null>(null);
    // A shared value rather than a ref: the gesture's callbacks run on the UI
    // thread, where a JS ref cannot be read.
    const atTop = useSharedValue(true);

    // `close` changes identity whenever the caller's `onClose` does, and the
    // gesture would be rebuilt and re-attached with it. This is the same call
    // behind a handle that never changes.
    const closeRef = useRef(close);
    closeRef.current = close;
    const requestClose = useCallback(() => closeRef.current(), []);

    const pan = useMemo(
      () =>
        Gesture.Pan()
          // Downward only, and only past a few points — so a tap on a button is
          // still a tap, and an upward flick belongs to the list.
          .activeOffsetY(DRAG_ACTIVATION_DISTANCE)
          .failOffsetY(-DRAG_ACTIVATION_DISTANCE)
          .simultaneousWithExternalGesture(scrollRef)
          .onUpdate((event) => {
            'worklet';
            if (!closeOnDragDown) return;
            // A list that can still scroll up keeps the drag.
            if (!atTop.value) return;
            if (event.translationY > 0) slide.value = event.translationY;
          })
          .onEnd((event) => {
            'worklet';
            if (!closeOnDragDown) return;

            const passedDistance =
              event.translationY > resolvedHeight * DRAG_CLOSE_RATIO;
            // velocityY is points per second here, not per frame.
            const flickedDown = event.velocityY > DRAG_CLOSE_FLING;

            if (atTop.value && (passedDistance || flickedDown)) {
              runOnJS(requestClose)();
            } else {
              slide.value = withTiming(0, {
                duration: OPEN_DURATION / 2,
                easing: SHEET_EASING,
              });
            }
          }),
      [atTop, closeOnDragDown, requestClose, resolvedHeight, slide]
    );

    const scrollCoordination = useMemo<ScrollCoordination>(
      () => ({
        scrollRef,
        setAtTop: (value: boolean) => {
          atTop.value = value;
        },
      }),
      [atTop]
    );

    // open − keyboard for the box, drag − keyboard for where it sits. The
    // keyboard never takes more than the sheet has, and the sheet rises by
    // exactly what it loses — the two being the same number is what keeps the
    // sheet's TOP edge still while the keyboard opens; only the body shortens.
    const sheetStyle = useAnimatedStyle(() => {
      const lift = Math.min(keyboardInset.value, resolvedHeight);
      return {
        opacity: entranceStarted.value,
        height: Math.max(resolvedHeight - lift, 0),
        transform: [
          // Its own height below the screen at 0, in place at 1.
          {
            translateY:
              slide.value - lift + (1 - entrance.value) * resolvedHeight,
          },
        ],
      };
    });

    // The backdrop fades on its own faster curve, and thins again as the sheet is
    // dragged away, so letting go halfway never leaves a full-strength scrim
    // behind a half-gone sheet.
    const backdropStyle = useAnimatedStyle(() => {
      const dragged =
        resolvedHeight > 0
          ? Math.min(Math.max(slide.value / resolvedHeight, 0), 1)
          : 0;
      return {
        opacity: backdropProgress.value * BACKDROP_OPACITY * (1 - dragged),
      };
    });

    if (!mounted) return null;

    return (
      <Modal
        transparent
        visible
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
        onShow={() => {
          isShown.current = true;
          if (!pendingOpen.current) return;
          pendingOpen.current = false;
          // Two frames after `onShow`, not on it: iOS reports the Modal as shown
          // while it is still settling, and an animation started in that window
          // spends its opening frames — the ones an ease-out puts most of the
          // distance into — behind a view that is not on screen yet.
          requestAnimationFrame(() => requestAnimationFrame(startOpen));
        }}
      >
        {/* Gesture handler needs a root of its own in here: a Modal is a separate
          native hierarchy, so the one the provider mounts around the app does
          not reach inside it and gestures would silently never fire. */}
        <GestureHandlerRootView style={styles.root}>
          <View style={styles.root} accessibilityViewIsModal>
            <Animated.View
              style={[styles.backdrop, backdropStyle]}
              pointerEvents={closeOnBackdropPress ? 'auto' : 'none'}
            >
              <Pressable
                style={styles.backdropPressable}
                onPress={closeOnBackdropPress ? close : undefined}
                accessibilityRole="button"
                accessibilityLabel="Close"
              />
            </Animated.View>

            {/* One view, because height and offset are now on the same thread:
                the split that used to be needed — layout on the JS driver, the
                transform on the native one — is what cost the entrance its
                animation whenever the content was slow to lay out. */}
            <GestureDetector gesture={pan}>
              <Animated.View
                style={[
                  styles.sheet,
                  style,
                  // The resting position belongs in the plain style too, not
                  // only in the animated one. There is a frame on Android
                  // between the dialog window coming in and the animated style
                  // landing, and a view with no transform yet is drawn where it
                  // was laid out — which flashed the sheet on screen before the
                  // entrance had begun, then took it away again. Starting it
                  // off screen here means that frame shows nothing.
                  { transform: [{ translateY: resolvedHeight }] },
                  sheetStyle,
                ]}
              >
                <View style={styles.handleArea}>
                  <View style={styles.handle} />
                </View>
                <ScrollCoordinationContext.Provider value={scrollCoordination}>
                  <View style={styles.body}>{children}</View>
                </ScrollCoordinationContext.Provider>
              </Animated.View>
            </GestureDetector>
          </View>
        </GestureHandlerRootView>
      </Modal>
    );
  }
);

/**
 * The scroll view a sheet's body should use.
 *
 * It is an ordinary ScrollView that also tells the sheet whether it is scrolled
 * to the top and hands the sheet its ref, which is what lets one downward drag
 * scroll the list until it reaches the top and then carry on into closing the
 * sheet, without the finger ever coming up.
 */
const BottomSheetScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function BottomSheetScrollView(
    { onScroll, scrollEventThrottle, ...rest },
    ref
  ) {
    const coordination = useContext(ScrollCoordinationContext);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      coordination?.setAtTop(event.nativeEvent.contentOffset.y <= 0);
      onScroll?.(event);
    };

    return (
      <ScrollView
        {...rest}
        ref={(node) => {
          if (coordination) {
            (
              coordination.scrollRef as React.MutableRefObject<unknown>
            ).current = node;
          }
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle ?? 16}
      />
    );
  }
);

/**
 * `BottomSheet.ScrollView` is the scroll view a sheet's body should use — see
 * the note on the component below.
 */
export const BottomSheet = Object.assign(BottomSheetRoot, {
  ScrollView: BottomSheetScrollView,
});
