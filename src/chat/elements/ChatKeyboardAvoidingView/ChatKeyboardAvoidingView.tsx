// ChatKeyboardAvoidingView — the single keyboard/bottom-inset owner for chat.
//
// The contract: every chat page renders SafeAreaView with edges
// ['top','left','right'] (NO bottom) and mounts this component DIRECTLY inside
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
// `yarn check:keyboard-avoiding` enforces that every such surface mounts it.
//
// How the two paddings add up
// ---------------------------
// RN's KeyboardAvoidingView owns `paddingBottom` outright in its 'padding'
// branch — it composes its own value LAST, so a caller's paddingBottom in
// `style` is always discarded, even while the keyboard is closed and the value
// is 0. That rules out expressing both halves of the contract on the KAV
// itself. So the safe-area inset lives on the inner View instead, and the two
// are made to sum to the real occlusion rather than stack on top of it:
//
//   keyboardVerticalOffset = ancestorOffset - insets.bottom
//
// `keyboardY = keyboardFrame.screenY - keyboardVerticalOffset`, so the
// `-insets.bottom` half raises keyboardY and KAV pads by
// `occlusion - insets.bottom`; the inner View adds the inset back, landing
// exactly on `occlusion`. The inset is already inside the occlusion on both
// platforms: on Android the OS reports the keyboard height with the
// navigation-bar inset subtracted while the keyboard physically covers the bar,
// and on iOS the keyboard covers the home indicator.
//
// The `ancestorOffset` half repairs KAV's own frame of reference — see
// `useAncestorOffset` in core/hooks.
//
// With the keyboard closed the offset is never read — RN short-circuits to
// bottom = 0 as soon as the keyboard event is null — so the inner inset stands
// alone and bottom-anchored content clears the navigation bar.
//
// Why `behavior` is 'padding' on Android too
// ------------------------------------------
// Leaving it undefined there makes KAV a plain View that relies on the OS
// resizing the window. Under Android 15+ edge-to-edge (targetSdk 36 here) that
// resize no longer happens: windowSoftInputMode=adjustResize is inert and the
// IME arrives as an inset the app has to consume itself.

// 1. React / RN imports
import { useRef, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

// 2. Third-party imports
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 3. Internal imports (relative)
import { useAncestorOffset } from '../../../core/hooks/useAncestorOffset';
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
  const contentRef = useRef<View>(null);
  const { ancestorOffset, measureAncestorOffset } =
    useAncestorOffset(contentRef);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={ancestorOffset - insets.bottom}
      onLayout={measureAncestorOffset}
      style={[styles.container, style]}
    >
      <View
        ref={contentRef}
        style={[styles.container, { paddingBottom: insets.bottom }]}
      >
        {children}
      </View>
    </KeyboardAvoidingView>
  );
}
