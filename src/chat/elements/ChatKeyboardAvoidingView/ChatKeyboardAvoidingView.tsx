// ChatKeyboardAvoidingView — the single keyboard/bottom-inset owner for chat.
//
// The contract: every chat page renders SafeAreaView with edges
// ['top','left','right'] (NO bottom) and mounts this component directly inside
// it, so the page owns layout and the feature underneath owns only content.
// While the keyboard is closed it pads by the safe-area inset so bottom-anchored
// content clears the navigation bar; while the keyboard is up it pads by however
// much of the keyboard actually covers this view, which shrinks the content box
// instead of letting the keyboard overlap it.
//
// Every page mounts it, not just the ones with an input today: the padding is a
// no-op until a keyboard actually opens, and mounting it uniformly means a
// screen that later grows a text field cannot silently miss out. Full-screen
// Modals mount it themselves — a Modal renders in its own native hierarchy, so
// nothing a page wraps around its content reaches inside one.
//
// Why this does not use RN's KeyboardAvoidingView
// -----------------------------------------------
// KeyboardAvoidingView derives its displacement from
// `frame.y + frame.height - keyboardY`, where the frame comes from its own
// onLayout — parent-relative — and keyboardY is screen-absolute. Mounted inside
// a SafeAreaView that pads the top inset, the two disagree by exactly that
// inset, so the compose bar lands short of the keyboard by the status-bar
// height. `behavior` cannot correct that, and the correction that would
// (keyboardVerticalOffset = insets.top) silently depends on which edges the
// hosting page happens to pad.
//
// How the overlap is measured
// ---------------------------
// This view's own bottom edge on screen, minus the keyboard's top edge. Measuring the view rather than the window is what makes one code path
// work everywhere, because whether the OS resizes anything varies by surface:
//   - A chat page on Android 15+ is NOT resized. Edge-to-edge ignores
//     windowSoftInputMode=adjustResize, so the view still reaches the bottom of
//     the screen and the full keyboard height has to be padded. Measured on a
//     Galaxy S24 (Android 16, targetSdk 36), keyboard open, in dp: window height
//     832 (unchanged with the keyboard up), keyboard screenY 473.6, reported
//     keyboard height 343.5, bottom inset 14.9. The real occlusion is 358.4 —
//     the reported height PLUS the bottom inset, because Android reports the
//     height with the navigation-bar inset already subtracted while the keyboard
//     covers the navigation bar.
//   - A Modal on Android IS resized: it gets its own dialog window, which the
//     OS shrinks to the keyboard's top edge. Padding by the window-derived
//     occlusion there double-counted and collapsed the content to nothing.
//   - iOS never resizes either surface, and the measurement reduces to the
//     keyboard height with the home indicator included.
// Measuring the view covers all three without a platform branch: where the OS
// already shrank the layout, the view's bottom is above the keyboard and the
// difference is zero.
//
// The measurement re-runs on every layout pass as well as on the keyboard
// events, because the two have no guaranteed order. In the Modal case the
// keyboard event lands first and measures the still-full-height dialog, then
// the resize arrives and the layout pass corrects the value to zero.

// 1. React / RN imports
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  View,
  type KeyboardEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

// 2. Third-party imports
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 3. Internal imports (relative)
import { useStyles } from './styles';

// 4. Types
type ChatKeyboardAvoidingViewProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// 5. Named function component
export function ChatKeyboardAvoidingView({
  children,
  style,
}: ChatKeyboardAvoidingViewProps) {
  const { styles } = useStyles();
  const insets = useSafeAreaInsets();
  const viewRef = useRef<View>(null);
  const { overlap, remeasure } = useKeyboardOverlap(viewRef);

  // The overlap already reaches the bottom of this view, so it replaces the
  // safe-area inset rather than stacking with it.
  const paddingBottom = overlap > 0 ? overlap : insets.bottom;

  return (
    <View
      ref={viewRef}
      onLayout={remeasure}
      style={[styles.container, { paddingBottom }, style]}
    >
      {children}
    </View>
  );
}

// How much of this view the keyboard currently covers, in dp; 0 when closed.
//
// iOS emits the `Will` pair, so the padding moves in step with the keyboard;
// Android only reliably emits the `Did` pair. Neither platform re-emits when the
// keyboard merely changes height while open (switching to an emoji panel, say),
// which is the same limitation RN's own KeyboardAvoidingView carries.
function useKeyboardOverlap(viewRef: React.RefObject<View | null>) {
  const [overlap, setOverlap] = useState(0);
  const keyboardTopRef = useRef<number | null>(null);

  const remeasure = useCallback(() => {
    if (keyboardTopRef.current === null) {
      setOverlap(0);
      return;
    }

    const keyboardTop = keyboardTopRef.current;

    // `measure` (pageY), not `measureInWindow`: on Android the window
    // measurement leaves out the status-bar offset, so the view's bottom reads
    // one status bar short of where it is and the compose bar ends up partly
    // under the keyboard. Measured on a Galaxy S24 with the keyboard up, in dp:
    // measureInWindow bottom 794.7 against a real screen bottom of 832, which
    // pageY + height reports correctly.
    viewRef.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
      // A measurement taken mid-teardown reads as zero; ignore it rather than
      // dropping the padding and letting the keyboard cover the content.
      if (height === 0) return;

      setOverlap(Math.max(pageY + height - keyboardTop, 0));
    });
  }, [viewRef]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleShow = (event: KeyboardEvent) => {
      animateWith(event);
      keyboardTopRef.current = event.endCoordinates.screenY;
      remeasure();
    };

    const handleHide = (event: KeyboardEvent) => {
      animateWith(event);
      keyboardTopRef.current = null;
      setOverlap(0);
    };

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [remeasure]);

  return { overlap, remeasure };
}

// Match the padding change to the keyboard's own slide, using the duration and
// curve the OS reports. Without this the padding reaches its final value on the
// next frame while the keyboard is still travelling, which on iOS leaves a band
// of empty background between the compose bar and the keyboard for the length of
// the animation (verified on an iPhone 16 Pro: the compose bar sat ~96pt above
// the arriving keyboard mid-slide). Android reports no duration on the `Did`
// events — the keyboard is already in place by then — so this is a no-op there.
function animateWith({ duration, easing }: KeyboardEvent) {
  if (!duration || !easing) return;

  const config = {
    // RCTLayoutAnimation rejects durations below 10ms.
    duration: Math.max(duration, 10),
    type: LayoutAnimation.Types[easing] ?? LayoutAnimation.Types.keyboard,
  };

  LayoutAnimation.configureNext({ ...config, update: config });
}
