import { useCallback, useState } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';

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
 *
 * Pass `measureAncestorOffset` to the KAV's `onLayout` and `contentRef` to a
 * View directly inside it. The content View's absolute top is the KAV's own
 * absolute top — the KAV only ever pads its BOTTOM — so it can stand in for a
 * ref that RN does not expose: KeyboardAvoidingView is a plain class component
 * with no forwarded ref and no `measure` method.
 */
export function useAncestorOffset(contentRef: React.RefObject<View | null>) {
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
