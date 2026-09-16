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
// `useAncestorOffset` below.
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
import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  View,
  type LayoutChangeEvent,
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

/**
 * Measures the one invariant KeyboardAvoidingView depends on without ever
 * checking: that its parent's origin sits at the top of the screen.
 *
 * KAV derives its displacement from `frame.y + frame.height`, where the frame
 * comes from its own onLayout and is therefore PARENT-relative, while the
 * keyboard is reported in screen coordinates. The two describe the same edge
 * only when nothing between this view and the top of the screen introduces an
 * offset. A host app that renders the UIKit under its own header — the example
 * app's module nav bar, a tab bar, any wrapper with padding — breaks that
 * silently: `frame.y` collapses while the view really starts further down, and
 * KAV pads short by exactly that difference, leaving the keyboard over the
 * compose bar with no error and a layout that still looks plausible.
 *
 * So measure the difference and hand it back as `keyboardVerticalOffset`:
 *
 *   padding  = (frame.y + frame.height) - (keyboardScreenY - offset)
 *   frame.y  = absoluteTop - ancestorOffset
 *   ⇒ offset = ancestorOffset - insets.bottom  lands padding on the occlusion.
 *
 * Correcting beats asserting because the offset is the host app's to own, not
 * this component's: an integrator is entitled to mount the UIKit below their
 * own chrome, and a warning telling them not to would have no fix behind it.
 *
 * The content View's absolute top is the KAV's own absolute top — the KAV only
 * ever pads its BOTTOM — so it can stand in for a ref that RN does not expose.
 * KeyboardAvoidingView is a plain class component with no forwarded ref and no
 * `measure` method; its inner ref is private.
 */
function useAncestorOffset(contentRef: React.RefObject<View | null>) {
  const [ancestorOffset, setAncestorOffset] = useState(0);

  const measureAncestorOffset = useCallback(
    (event: LayoutChangeEvent) => {
      // The very frame KAV is about to do its arithmetic on.
      const { y: parentRelativeTop } = event.nativeEvent.layout;

      contentRef.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
        // A measurement taken mid-teardown reads as zero and proves nothing.
        if (height === 0) return;

        const offset = pageY - parentRelativeTop;

        setAncestorOffset((current) =>
          // Sub-pixel rounding between the two measurement paths is expected;
          // re-rendering on it would only churn.
          Math.abs(offset - current) < 1 ? current : offset
        );
      });
    },
    [contentRef]
  );

  return { ancestorOffset, measureAncestorOffset };
}
