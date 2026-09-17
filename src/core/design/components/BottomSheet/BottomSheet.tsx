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
//   height = open − drag − keyboard        (bottom edge pinned)
//   offset = −keyboard                     (lifts clear of the keys)
//
// Opening, dragging and the keyboard are all the same quantity — height — which
// is why a drag that interrupts an animation has nothing to disagree with.
//
// It renders in a Modal on purpose. A Modal is its own native hierarchy, so
// nothing an ancestor does to its layout — a keyboard-avoiding wrapper padding
// the page, a parent that clips — reaches the sheet. That makes this component
// the only thing moving it, which is the point.

// 1. React / RN imports
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  BackHandler,
  Easing,
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
  type ScrollViewProps,
} from 'react-native';

// 2. Third-party imports
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 3. Internal imports (relative)
import { useStyles } from './styles';

// 4. Types
export type BottomSheetProps = {
  visible: boolean;
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
  onClose: () => void;
  children: ReactNode;
};

const OPEN_DURATION = 500;
const CLOSE_DURATION = 500;
/**
 * Exponential-out: fast off the mark, long soft landing. A cubic ease reads as
 * abrupt at these durations — the sheet arrives before the eye expects it to.
 */
const SHEET_EASING = Easing.out(Easing.exp);
/** Past this much of the sheet's height, releasing a drag closes it. */
const DRAG_CLOSE_RATIO = 0.3;
/** A flick this fast (points per second) closes the sheet whatever the distance. */
const DRAG_CLOSE_FLING = 800;
/** A drag has to travel this far before it is a drag and not a tap. */
const DRAG_ACTIVATION_DISTANCE = 8;
const BACKDROP_OPACITY = 0.32;

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
/** The backdrop runs this much faster than the sheet, opening and closing. */
const BACKDROP_SPEEDUP = 2.5;

// 5. Named function component
export function BottomSheet({
  visible,
  height,
  containerHeight,
  dark = false,
  closeOnDragDown = true,
  closeOnBackdropPress = true,
  onClose,
  children,
}: BottomSheetProps) {
  const { styles } = useStyles({ dark });
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();

  const container = containerHeight ?? window.height;
  const resolvedHeight =
    typeof height === 'number'
      ? height
      : (container * parseFloat(height)) / 100;

  // Kept mounted through the closing animation, so the sheet slides out instead
  // of vanishing the moment `visible` flips.
  const [mounted, setMounted] = useState(visible);

  // The sheet opens by GROWING from the bottom edge rather than sliding up as a
  // finished panel, and a drag takes height off the same value — so the bottom
  // edge is pinned throughout and only the top edge ever moves. Every state the
  // sheet can be in is one number.
  const openHeight = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const keyboardInset = useRef(new Animated.Value(0)).current;
  const backdropProgress = useRef(new Animated.Value(0)).current;

  // While the sheet is on its way out the keyboard must not resize it: the
  // dismissal that closes the sheet also dismisses the keyboard, and letting
  // that grow the sheet back is exactly the upward flash this replaces.
  const isClosing = useRef(false);

  const close = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;

    Animated.parallel([
      Animated.timing(openHeight, {
        toValue: 0,
        duration: CLOSE_DURATION,
        easing: SHEET_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(backdropProgress, {
        toValue: 0,
        // The backdrop clears faster than the sheet, so the page behind is
        // already readable while the last of the sheet is still on its way out.
        duration: CLOSE_DURATION / BACKDROP_SPEEDUP,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setMounted(false);
      dragY.setValue(0);
      keyboardInset.setValue(0);
      isClosing.current = false;
      onClose();
    });
  }, [backdropProgress, dragY, keyboardInset, onClose, openHeight]);

  // Open / close from the outside.
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setMounted(true);
      Animated.parallel([
        Animated.timing(openHeight, {
          toValue: resolvedHeight,
          duration: OPEN_DURATION,
          easing: SHEET_EASING,
          useNativeDriver: false,
        }),
        Animated.timing(backdropProgress, {
          toValue: 1,
          duration: OPEN_DURATION / BACKDROP_SPEEDUP,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (mounted) {
      close();
    }
  }, [visible, mounted, close, openHeight, backdropProgress, resolvedHeight]);

  // The keyboard, on the keyboard's own curve. Reading `duration` and `easing`
  // off the event is what keeps the sheet and the keyboard on one timeline
  // rather than two that happen to start together.
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

    const animateTo = (toValue: number, event?: KeyboardEvent) =>
      Animated.timing(keyboardInset, {
        toValue,
        duration: event?.duration || OPEN_DURATION,
        easing: SHEET_EASING,
        useNativeDriver: false,
      }).start();

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
  const atTop = useRef(true);
  const gestureConfig = useRef({ resolvedHeight, closeOnDragDown, close });
  gestureConfig.current = { resolvedHeight, closeOnDragDown, close };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        // Downward only, and only past a few points — so a tap on a button is
        // still a tap, and an upward flick belongs to the list.
        .activeOffsetY(DRAG_ACTIVATION_DISTANCE)
        .failOffsetY(-DRAG_ACTIVATION_DISTANCE)
        .simultaneousWithExternalGesture(scrollRef)
        .onUpdate((event) => {
          if (!gestureConfig.current.closeOnDragDown) return;
          // A list that can still scroll up keeps the drag.
          if (!atTop.current) return;
          if (event.translationY > 0) dragY.setValue(event.translationY);
        })
        .onEnd((event) => {
          if (!gestureConfig.current.closeOnDragDown) return;

          const passedDistance =
            event.translationY >
            gestureConfig.current.resolvedHeight * DRAG_CLOSE_RATIO;
          // velocityY is points per second here, not per frame.
          const flickedDown = event.velocityY > DRAG_CLOSE_FLING;

          if (atTop.current && (passedDistance || flickedDown)) {
            gestureConfig.current.close();
          } else {
            Animated.timing(dragY, {
              toValue: 0,
              duration: OPEN_DURATION / 2,
              easing: SHEET_EASING,
              useNativeDriver: false,
            }).start();
          }
        }),
    [dragY]
  );

  const scrollCoordination = useMemo<ScrollCoordination>(
    () => ({
      scrollRef,
      setAtTop: (value: boolean) => {
        atTop.current = value;
      },
    }),
    []
  );

  if (!mounted) return null;

  // The keyboard never takes more than the sheet has.
  const clampedKeyboardInset = keyboardInset.interpolate({
    inputRange: [0, resolvedHeight],
    outputRange: [0, resolvedHeight],
    extrapolate: 'clamp',
  });

  // open − drag − keyboard. The open animation and the drag are the same
  // quantity from the sheet's point of view, which is why a drag interrupted
  // mid-open has nothing to disagree with.
  const sheetHeight = Animated.subtract(
    Animated.subtract(openHeight, dragY),
    clampedKeyboardInset
  );

  // Shrinking alone would leave the sheet on the bottom of the screen with the
  // keyboard drawn over it, so it also rises by exactly what it loses. The two
  // being the same number is what keeps the sheet's TOP edge still while the
  // keyboard opens — only the body gets shorter.
  const translateY = Animated.multiply(clampedKeyboardInset, -1);

  // The backdrop fades on its own faster curve, and thins again as the sheet is
  // dragged away, so letting go halfway never leaves a full-strength scrim
  // behind a half-gone sheet.
  const backdropOpacity = Animated.multiply(
    backdropProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, BACKDROP_OPACITY],
    }),
    dragY.interpolate({
      inputRange: [0, resolvedHeight],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })
  );

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      {/* Gesture handler needs a root of its own in here: a Modal is a separate
          native hierarchy, so the one the provider mounts around the app does
          not reach inside it and gestures would silently never fire. */}
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.root} accessibilityViewIsModal>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
            pointerEvents={closeOnBackdropPress ? 'auto' : 'none'}
          >
            <Pressable
              style={styles.backdropPressable}
              onPress={closeOnBackdropPress ? close : undefined}
              accessibilityRole="button"
              accessibilityLabel="Close"
            />
          </Animated.View>

          <GestureDetector gesture={pan}>
            <Animated.View
              style={[
                styles.sheet,
                { height: sheetHeight, transform: [{ translateY }] },
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

BottomSheet.ScrollView = BottomSheetScrollView;
