// ChatKeyboardAvoidingView — the single keyboard/bottom-inset owner for every
// chat screen that has a bottom-anchored input (compose bar, search field).
//
// Why this exists: each screen used to inline its own KeyboardAvoidingView with
// `behavior={ios ? 'padding' : undefined}` and no bottom inset, while the page
// wrapper used React Native's built-in SafeAreaView (a no-op on Android). That
// combination produced three separate QA reports from one root cause:
//   - PDT-4910: iOS compose bar sat behind the keyboard.
//   - PDT-5184: Android navigation bar overlapped the compose bar.
//   - PDT-4925: the New Conversation search screen had no KAV at all, so the
//     empty state stayed under the keyboard.
//
// The contract: the hosting page renders SafeAreaView with edges
// ['top','left','right'] (NO bottom) and this component owns the bottom edge —
// it pads by the bottom inset while the keyboard is closed and drops that
// padding once the keyboard is up, so the inset and the keyboard never stack.
//
// None of the three reports above has been re-tested on a device. What is
// verified is the mechanism: safe-area-context reads real WindowInsets, so the
// keyboard-closed case (which is what PDT-5184 reported) gets a real bottom
// inset under edge-to-edge and a harmless zero without it. The keyboard-open
// path on Android is the weak spot — see the behavior prop below.

// 1. React / RN imports
import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
  const isKeyboardOpen = useIsKeyboardOpen();

  // While the keyboard is up it already occupies the bottom edge, so the
  // safe-area inset would double-pad and lift the composer off the keyboard.
  const paddingBottom = isKeyboardOpen ? 0 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom }, style]}
      // iOS never resizes the app window for the keyboard, so the view pads
      // itself.
      //
      // Android is left undefined because the manifest sets
      // windowSoftInputMode=adjustResize. TREAT THAT AS UNVERIFIED: the example
      // app targets SDK 36 and ships no windowOptOutEdgeToEdgeEnforcement, so
      // the OS runs it edge-to-edge, where adjustResize no longer resizes the
      // window the way it did pre-Android-15 and the app is expected to consume
      // the IME inset itself. The Android keyboard path has not been checked on
      // a device; if the compose bar fails to rise with the keyboard there,
      // this is the line to revisit (see also edgeToEdgeEnabled=false in
      // example/android/gradle.properties, which disagrees with the OS).
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

// Tracks keyboard visibility. iOS emits the `Will` pair (so padding animates in
// step with the keyboard); Android only reliably emits the `Did` pair.
function useIsKeyboardOpen(): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return isOpen;
}
