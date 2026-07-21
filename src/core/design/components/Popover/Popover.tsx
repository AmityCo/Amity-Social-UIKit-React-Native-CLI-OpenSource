// Popover — ported from AmityUiKitWeb core/design/components/Popover.
// Web uses react-aria overlay positioning with a `trigger` render-prop and a
// node-or-function `children` render-prop. RN has no react-aria, so this is
// implemented with a transparent `Modal` acting as an anchored overlay: the
// trigger wrapper is measured with `measureInWindow`, and the popover content
// is absolutely positioned near the anchor. Tapping the backdrop closes it.
// The public API (function `trigger`, node-or-function `children`, `placement`)
// is kept so callers such as Menu and header buttons work unchanged.

import React, { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, View } from 'react-native';
import { useStyles } from './styles';

// react-aria placements are space-separated (e.g. 'bottom right'); we accept the
// full string and read the two axes we support (vertical: top/bottom, horizontal
// alignment: left/right).
export type PopoverPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right';

type TriggerArgs = {
  isOpen: boolean;
  isDesktop: boolean;
  openPopover: () => void;
  closePopover: () => void;
};

type ChildrenArgs = { closePopover: () => void };

export type PopoverProps = {
  trigger: (args: TriggerArgs) => React.ReactNode;
  children: React.ReactNode | ((args: ChildrenArgs) => React.ReactNode);
  placement?: PopoverPlacement;
  onOpen?: () => void;
  onClose?: () => void;
};

type Anchor = { x: number; y: number; width: number; height: number };

// Gap between the trigger and the popover content (web `--origin` 0.5rem = 8px).
const ANCHOR_GAP = 8;
// Keep the popover this far from the screen edges, and never narrower than the
// content min-width (styles.popover minWidth 200) when clamping.
const SCREEN_MARGIN = 8;
const POPOVER_MIN_WIDTH = 200;

export function Popover({
  trigger,
  children,
  placement = 'bottom right',
  onOpen,
  onClose,
}: PopoverProps) {
  const { styles } = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = useRef<View>(null);

  const openPopover = () => {
    // Measure the trigger in window coordinates, then open once positioned.
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setIsOpen(true);
      onOpen?.();
    });
  };

  const closePopover = () => {
    setIsOpen(false);
    onClose?.();
  };

  const isTop = placement.includes('top');
  const isRight = placement.includes('right');
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Vertical: place above (top) or below (bottom) the anchor.
  const verticalPosition = isTop
    ? { bottom: screenHeight - anchor.y + ANCHOR_GAP }
    : { top: anchor.y + anchor.height + ANCHOR_GAP };

  // Horizontal alignment: right-align to the anchor's right edge, else left-align to
  // the anchor's left edge (the bubble's start). Clamp so the popover (min-width 200)
  // never runs past either screen edge — the off-screen overflow inbound bubbles hit.
  const maxInset = Math.max(
    SCREEN_MARGIN,
    screenWidth - POPOVER_MIN_WIDTH - SCREEN_MARGIN
  );
  const horizontalPosition = isRight
    ? {
        right: Math.min(
          maxInset,
          Math.max(SCREEN_MARGIN, screenWidth - (anchor.x + anchor.width))
        ),
      }
    : { left: Math.min(maxInset, Math.max(SCREEN_MARGIN, anchor.x)) };

  return (
    <View ref={triggerRef} collapsable={false}>
      {trigger({ isOpen, isDesktop: true, openPopover, closePopover })}
      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={closePopover}
      >
        <Pressable style={styles.backdrop} onPress={closePopover}>
          {/* Inner Pressable absorbs taps so touches inside the content do not
              bubble to the backdrop and close the popover. */}
          <Pressable
            style={[styles.popover, verticalPosition, horizontalPosition]}
            onPress={() => {}}
          >
            {typeof children === 'function'
              ? children({ closePopover })
              : children}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
