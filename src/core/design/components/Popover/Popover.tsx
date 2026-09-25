// Popover — ported from AmityUiKitWeb core/design/components/Popover.
// Web uses react-aria overlay positioning with a `trigger` render-prop and a
// node-or-function `children` render-prop. RN has no react-aria, so this is
// implemented with a transparent `Modal` acting as an anchored overlay: the
// trigger wrapper is measured with `measureInWindow`, and the popover content
// is absolutely positioned near the anchor. Tapping the backdrop closes it.
// The public API (function `trigger`, node-or-function `children`, `placement`)
// is kept so callers such as Menu and header buttons work unchanged.
//
// A function `children` also receives `isAbove`: whether the popover resolved
// to open above the anchor (explicit 'top' placement, or flipped for lack of
// room below). Content that stacks several surfaces can reorder itself so the
// piece meant to sit next to the anchor stays next to it on either side (web
// leaves that to react-aria's placement data attribute).
//
// An optional `above` render-prop places a second surface on the OPPOSITE side
// of the anchor while the main content opens below it — the chat design puts
// the reaction bar above a bubble and the action menu under it, with the
// message visible in between. It is not rendered once the popover flips above
// (there is no room under the anchor by definition); callers fold that content
// into `children` instead, which is why both render-props receive `isAbove`.

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

type ChildrenArgs = {
  closePopover: () => void;
  /** True when the popover opens above the anchor (see header). */
  isAbove: boolean;
};

export type PopoverProps = {
  trigger: (args: TriggerArgs) => React.ReactNode;
  children: React.ReactNode | ((args: ChildrenArgs) => React.ReactNode);
  /**
   * Content anchored above the trigger while `children` opens below it. Not
   * rendered when the popover itself opens above (see header).
   */
  above?: (args: ChildrenArgs) => React.ReactNode;
  placement?: PopoverPlacement;
  onOpen?: () => void;
  onClose?: () => void;
  /**
   * When false, the popover renders NO card surface (bg/radius/shadow) — only
   * positioning — so the caller can supply its own separate floating surfaces.
   * Defaults to true (the standard single card).
   */
  surface?: boolean;
};

type Anchor = { x: number; y: number; width: number; height: number };

// Gap between the trigger and the popover content (web `--origin` 0.5rem = 8px).
const ANCHOR_GAP = 8;
// Keep the popover this far from the screen edges, and never narrower than the
// content min-width (styles.popover minWidth 200) when clamping.
const SCREEN_MARGIN = 8;
const POPOVER_MIN_WIDTH = 200;
// Approx tallest menu; if less room than this below the anchor, open upward.
const ESTIMATED_MENU_HEIGHT = 260;

export function Popover({
  trigger,
  children,
  above,
  placement = 'bottom right',
  onOpen,
  onClose,
  surface = true,
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
  /**
   * The backdrop's own measured height.
   *
   * `bottom` is resolved against the PARENT box, which here is the backdrop
   * inside the Modal — and on Android that box excludes the status bar and the
   * gesture/navigation bar, while `Dimensions.get('window').height` reports the
   * full screen. Mixing the two put the flipped-above popover ~76dp too high on
   * a 420dpi device (measured: 84dp of air above the bubble instead of 8dp), and
   * by a constant, so it read as "the menu is always far from the bubble".
   *
   * The `top` branch never had the problem: it is anchor-relative and never
   * touches this number. Falls back to the Dimensions value until the first
   * layout, which only affects the very first frame.
   */
  const [backdropHeight, setBackdropHeight] = useState<number | null>(null);

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

  const isRight = placement.includes('right');
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Vertical: honor an explicit 'top', but also flip above the anchor when there
  // isn't room below (chat bubbles sit near the bottom, so a 'bottom' menu would
  // otherwise clip off the screen).
  const spaceBelow = screenHeight - (anchor.y + anchor.height);
  const isTop = placement.includes('top') || spaceBelow < ESTIMATED_MENU_HEIGHT;
  // `bottom` is relative to the backdrop, so measure the backdrop rather than
  // assuming it matches the window (see backdropHeight).
  const bottomReference = backdropHeight ?? screenHeight;
  const abovePosition = { bottom: bottomReference - anchor.y + ANCHOR_GAP };
  const verticalPosition = isTop
    ? abovePosition
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

  const content =
    typeof children === 'function'
      ? children({ closePopover, isAbove: isTop })
      : children;
  // The companion surface only exists while the main content sits below.
  const aboveContent = isTop
    ? null
    : above?.({ closePopover, isAbove: false }) ?? null;

  return (
    <View ref={triggerRef} collapsable={false}>
      {trigger({ isOpen, isDesktop: true, openPopover, closePopover })}
      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={closePopover}
      >
        <Pressable
          style={styles.backdrop}
          onPress={closePopover}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height > 0) setBackdropHeight(height);
          }}
        >
          {/* Inner Pressable absorbs taps so touches inside the content do not
              bubble to the backdrop and close the popover. */}
          <Pressable
            style={[
              surface ? styles.popover : styles.popoverBare,
              verticalPosition,
              horizontalPosition,
            ]}
            onPress={() => {}}
          >
            {surface ? (
              // The card's radius + shadow sit on the Pressable above; the clip
              // has to be a separate inner layer or iOS clips the shadow away.
              <View style={styles.clip}>{content}</View>
            ) : (
              content
            )}
          </Pressable>
          {aboveContent ? (
            <Pressable
              style={[
                surface ? styles.popover : styles.popoverBare,
                abovePosition,
                horizontalPosition,
              ]}
              onPress={() => {}}
            >
              {surface ? (
                <View style={styles.clip}>{aboveContent}</View>
              ) : (
                aboveContent
              )}
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}
