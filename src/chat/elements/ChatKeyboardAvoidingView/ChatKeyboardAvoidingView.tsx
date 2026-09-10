// ChatKeyboardAvoidingView — the single keyboard/bottom-inset owner for chat.
//
// The contract: every chat page renders SafeAreaView with edges
// ['top','left','right'] (NO bottom) and mounts this component directly inside
// it, so the page owns layout and the feature underneath owns only content.
// While the keyboard is closed it pads by the safe-area inset so bottom-anchored
// content clears the navigation bar; while the keyboard is up it pads by however
// much of the window the keyboard actually covers, which shrinks the content box
// instead of letting the keyboard overlap it.
//
// Every page mounts it, not just the ones with an input today: the padding is a
// no-op until a keyboard actually opens, and mounting it uniformly means a
// screen that later grows a text field cannot silently miss out.
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
// Measured on a Galaxy S24 (Android 16, targetSdk 36, edge-to-edge), keyboard
// open, in dp: window height 832, keyboard screenY 473.6, reported keyboard
// height 343.5, bottom inset 14.9. Two things follow:
//   - The window height is unchanged with the keyboard up, so the OS is not
//     resizing the window (edge-to-edge ignores windowSoftInputMode=adjustResize
//     from Android 15 on) and the app has to consume the IME inset itself.
//   - The real occlusion is `windowHeight - screenY` = 358.4dp, which is the
//     reported keyboard height PLUS the bottom inset: Android reports the
//     keyboard height with the navigation-bar inset already subtracted, and the
//     keyboard covers the navigation bar. Adding the safe-area inset on top of
//     that would over-pad and float the compose bar above the keyboard.
//
// `windowHeight - screenY` is also the right expression on iOS (the window spans
// the screen there, so it reduces to the keyboard height, home indicator
// included) and it self-corrects on any OS that does resize the window: the
// window shrinks to the keyboard's top edge, the difference goes to zero, and
// the already-shrunk layout is left alone.

// 1. React / RN imports
import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  Platform,
  useWindowDimensions,
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
  const keyboardOverlap = useKeyboardOverlap();

  // The overlap already reaches the bottom of the window, so it replaces the
  // safe-area inset rather than stacking with it.
  const paddingBottom = keyboardOverlap > 0 ? keyboardOverlap : insets.bottom;

  return (
    <View style={[styles.container, { paddingBottom }, style]}>{children}</View>
  );
}

// How much of the window the keyboard currently covers, in dp; 0 when closed.
//
// Only the keyboard's top edge is held in state — the window height is read
// during render, so a rotation or a split-screen resize while the keyboard is
// already up recomputes instead of keeping a stale overlap.
//
// iOS emits the `Will` pair, so the padding moves in step with the keyboard;
// Android only reliably emits the `Did` pair. Neither platform re-emits when the
// keyboard merely changes height while open (switching to an emoji panel, say),
// which is the same limitation RN's own KeyboardAvoidingView carries.
function useKeyboardOverlap(): number {
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleShow = (event: KeyboardEvent) =>
      setKeyboardTop(event.endCoordinates.screenY);

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardTop(null));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (keyboardTop === null) return 0;

  return Math.max(windowHeight - keyboardTop, 0);
}
