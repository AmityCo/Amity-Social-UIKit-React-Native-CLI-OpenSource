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
//   keyboardVerticalOffset = -insets.bottom
//
// `keyboardY = keyboardFrame.screenY - keyboardVerticalOffset`, so a NEGATIVE
// offset raises keyboardY and KAV pads by `occlusion - insets.bottom`; the
// inner View adds the inset back, landing exactly on `occlusion`. The inset is
// already inside the occlusion on both platforms: on Android the OS reports the
// keyboard height with the navigation-bar inset subtracted while the keyboard
// physically covers the bar, and on iOS the keyboard covers the home indicator.
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
import { useCallback, useRef, type ReactNode } from 'react';
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
  const assertNoAncestorOffset = useAncestorOffsetAssertion(contentRef);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={-insets.bottom}
      onLayout={assertNoAncestorOffset}
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
 * Dev-only guard for the one invariant KeyboardAvoidingView depends on without
 * ever checking: that its parent's origin sits at the top of the screen.
 *
 * KAV derives its displacement from `frame.y + frame.height`, where the frame
 * comes from its own onLayout and is therefore PARENT-relative, while the
 * keyboard is reported in screen coordinates. The two describe the same edge
 * only when nothing between this view and the top of the screen introduces an
 * offset — so `frame.y` has to equal this view's absolute top. Mounted one
 * level deeper than the page's SafeAreaView, a wrapper absorbs the top inset,
 * `frame.y` collapses to 0, and KAV pads short by exactly that inset: the
 * compose bar ends up under the keyboard by a status bar's worth, with no
 * error, no warning, and a layout that still looks plausible.
 *
 * This measures the invariant rather than the JSX shape that usually implies
 * it: a static rule cannot see padding that lives in another file's stylesheet,
 * and would flag harmless wrappers that introduce no offset at all.
 *
 * The content View's absolute top is the KAV's own absolute top — the KAV only
 * ever pads its BOTTOM — so it can stand in for a ref that RN does not expose.
 * KeyboardAvoidingView is a plain class component with no forwarded ref and no
 * `measure` method; its inner ref is private.
 */
function useAncestorOffsetAssertion(contentRef: React.RefObject<View | null>) {
  return useCallback(
    (event: LayoutChangeEvent) => {
      if (!__DEV__) return;

      // The very frame KAV is about to do its arithmetic on.
      const { y: parentRelativeTop } = event.nativeEvent.layout;

      contentRef.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
        // A measurement taken mid-teardown reads as zero and proves nothing.
        if (height === 0) return;

        const drift = pageY - parentRelativeTop;

        // Sub-pixel rounding between the two measurement paths is expected.
        if (Math.abs(drift) < 1) return;

        console.error(
          `[ChatKeyboardAvoidingView] mounted under ${drift}dp of ancestor ` +
            `offset. KeyboardAvoidingView measures its frame relative to its ` +
            `parent (top ${parentRelativeTop}dp) while the keyboard is ` +
            `reported in screen coordinates (this view really starts at ` +
            `${pageY}dp), so it will pad ${drift}dp short and the keyboard ` +
            `will cover that much content. Mount this directly inside the ` +
            `screen's SafeAreaView, with nothing between them that adds ` +
            `padding, margin or a transform.`
        );
      });
    },
    [contentRef]
  );
}
