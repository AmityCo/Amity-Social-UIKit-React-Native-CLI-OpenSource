// ReactionPicker — RN port of AmityUiKitWeb v4/chat/elements/ReactionPicker.
// The horizontal reactions row shown in the message action popover. Tapping a
// reaction fires onReactionClick (+ onSelectReaction), matching web. The active
// reaction shows the reactionstate-active circle; the reaction name floats above
// the icon the touch is currently over.
//
// RN adaptations from web:
//   - Web reads the reaction set from CustomReactionProvider; RN has no runtime
//     accessor for the top-level `message_reactions` config, so it defaults to
//     DEFAULT_MESSAGE_REACTIONS (overridable via the `reactions` prop).
//   - Web renders reaction.image URLs; RN renders the ported ReactionGlyph art.
//   - Web drives the drag highlight from a `hoveredReaction` prop that the
//     popover computes from pointer/touch coordinates and feeds back in as
//     `data-touch-hovered`. RN owns that state internally instead (see below),
//     so the element stays a drop-in for the existing action menu.
//
// Two defects, one root cause: the port dropped the touch-hover drag entirely
// as a "pointer-only interaction", so:
//   * no icon ever lifted while dragging across the bar, and
//   * the name label was bound to Pressable's `pressed` flag and drawn at
//     top:-33, i.e. outside the picker's own box, where the action menu's
//     `pickerCard` (overflow:'hidden', borderRadius:20) clipped it.
// Both are fixed here by reinstating web's interaction: a PanResponder on the
// row maps the touch's pageX onto the measured icon slots and drives a
// `hovered` reaction, and the label overhangs the pill the way web's does —
// `pickerCard` no longer draws a clipping surface, so nothing crops it.
//
// Geometry mirrored from ReactionPicker.module.css:
//   .reactionButton[data-touch-hovered] .reactionButton__icon
//       -> transform: scale(1.3) translateY(-8px); transition .15s ease-out
//   .reactionButton[data-touch-hovered] .reactionButton__text
//       -> opacity 1 + translateY(-9px) on top of its base top:-2.05rem (-32.8px)

// 1. React / RN imports
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  View,
  type PanResponderInstance,
} from 'react-native';

// 2. Internal imports
import { Typography } from '../../../core/design/components/Typography';
import { resolveString } from '../../../core/localization';
import {
  DEFAULT_MESSAGE_REACTIONS,
  ReactionGlyph,
} from '../../features/shared/utils/reactionIcons';
import { PILL_PADDING, useStyles } from './styles';

// Web: `transform: scale(1.3) translateY(-8px)` / label `translateY(-9px)`,
// both `transition: transform .15s ease-out`.
const LIFT_TRANSLATE_Y = -8;
const LIFT_SCALE = 1.3;
const LABEL_TRANSLATE_Y = -9;
const LIFT_DURATION_MS = 150;

// Slop before the row steals the touch from the per-icon Pressable. Below this a
// touch is still a plain tap (so tap-to-react and screen-reader activation keep
// working); above it the gesture becomes a drag across the bar.
const DRAG_ACTIVATION_PX = 4;

// 3. Types
export type ReactionPickerProps = {
  /** Reaction names to show. Defaults to the standard message reaction set. */
  reactions?: readonly string[];
  myReaction?: string | null;
  onReactionClick: (reactionName: string) => void;
  onSelectReaction?: (reactionName: string) => void;
  pageId?: string;
  componentId?: string;
};

type Slot = { name: string; start: number; end: number };

// Web CustomReactionProvider.getChatReactionLabel.
function getChatReactionLabel(reactionName: string): string {
  const name = reactionName.toLowerCase();
  const key = `amity_chat_reaction_label_${name}`;
  const localized = resolveString(key);
  return localized === key ? reactionName : localized;
}

// 4. Named function component
export function ReactionPicker({
  reactions = DEFAULT_MESSAGE_REACTIONS,
  myReaction,
  onReactionClick,
  onSelectReaction,
}: ReactionPickerProps) {
  const { styles } = useStyles();
  const [hovered, setHovered] = useState<string | null>(null);

  // One 0→1 driver per reaction: 0 = at rest, 1 = touch-hovered (web's
  // data-touch-hovered). Drives both the icon lift and the label reveal.
  const lifts = useMemo(() => {
    const map: Record<string, Animated.Value> = {};
    reactions.forEach((name) => {
      map[name] = new Animated.Value(0);
    });
    return map;
  }, [reactions]);

  useEffect(() => {
    Animated.parallel(
      reactions.map((name) =>
        Animated.timing(lifts[name], {
          toValue: hovered === name ? 1 : 0,
          duration: LIFT_DURATION_MS,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [hovered, reactions, lifts]);

  // --- shared label --------------------------------------------------------
  // The label is one node at the root, so its reveal needs its own 0→1 driver
  // (the per-icon `lifts` still drive the icons themselves).
  const labelAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: hovered ? 1 : 0,
      duration: LIFT_DURATION_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [hovered, labelAnim]);

  // Measured so the label can be centred over the hovered icon and kept inside
  // the pill. Both come from onLayout, so the first hover after mount already
  // has them.
  const [pillWidth, setPillWidth] = useState(0);
  const [labelWidth, setLabelWidth] = useState(0);

  // --- drag tracking -------------------------------------------------------
  // The PanResponder closure is built once, so everything it reads lives in a
  // ref; `hovered` state is only the render mirror.
  const rowRef = useRef<View>(null);
  const rowPageXRef = useRef(0);
  const slotsRef = useRef<Slot[]>([]);
  const hoveredRef = useRef<string | null>(null);
  const draggingRef = useRef(false);
  const onPickRef = useRef<(name: string) => void>(() => {});

  onPickRef.current = (reactionName: string) => {
    onReactionClick(reactionName);
    onSelectReaction?.(reactionName);
  };

  function setHoveredReaction(name: string | null) {
    if (hoveredRef.current === name) return;
    hoveredRef.current = name;
    setHovered(name);
  }

  function measureRow() {
    rowRef.current?.measureInWindow((x) => {
      rowPageXRef.current = x;
    });
  }

  // Web resolves the hovered reaction from the touch point; the slots are the
  // icons' measured x-ranges within the row.
  function reactionAt(pageX: number): string | null {
    const slots = slotsRef.current.filter(Boolean);
    if (slots.length === 0) return null;

    const local = pageX - rowPageXRef.current;
    const first = slots[0];
    const last = slots[slots.length - 1];
    // Dragging off either end of the pill clears the highlight, like web
    // dropping data-touch-hovered when the pointer leaves the picker.
    if (local < first.start - PILL_PADDING || local > last.end + PILL_PADDING) {
      return null;
    }

    // Snap to the nearest icon so the 8px gaps between them don't flicker.
    let nearest = first;
    let bestDistance = Number.POSITIVE_INFINITY;
    slots.forEach((slot) => {
      const distance = Math.abs(local - (slot.start + slot.end) / 2);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = slot;
      }
    });
    return nearest.name;
  }

  const panRef = useRef<PanResponderInstance | null>(null);
  if (panRef.current == null) {
    panRef.current = PanResponder.create({
      // Let a plain tap stay with the per-icon Pressable...
      onStartShouldSetPanResponderCapture: () => false,
      // ...and only take over once the finger actually travels.
      onMoveShouldSetPanResponderCapture: (_event, gesture) =>
        Math.abs(gesture.dx) > DRAG_ACTIVATION_PX ||
        Math.abs(gesture.dy) > DRAG_ACTIVATION_PX,
      onPanResponderGrant: (event) => {
        draggingRef.current = true;
        // Re-measure in case the popover was laid out again since mount; the
        // callback lands well before the first move event is handled.
        measureRow();
        setHoveredReaction(reactionAt(event.nativeEvent.pageX));
      },
      onPanResponderMove: (event) => {
        setHoveredReaction(reactionAt(event.nativeEvent.pageX));
      },
      onPanResponderRelease: () => {
        const picked = hoveredRef.current;
        draggingRef.current = false;
        setHoveredReaction(null);
        if (picked) onPickRef.current(picked);
      },
      onPanResponderTerminate: () => {
        draggingRef.current = false;
        setHoveredReaction(null);
      },
    });
  }

  // Centre the label on the hovered icon, then keep it inside the pill. The
  // slots are row-relative, so add the pill's padding to reach pill coordinates;
  // `labelAnchor` already centres the bubble, so the shift is measured from the
  // pill's centre. A name wider than the pill just stays centred.
  let labelShift = 0;
  if (hovered && pillWidth > 0 && labelWidth > 0) {
    const slot = slotsRef.current.find((s) => s && s.name === hovered);
    if (slot) {
      const iconCentre = PILL_PADDING + (slot.start + slot.end) / 2;
      const maxShift = Math.max(0, (pillWidth - labelWidth) / 2);
      const wanted = iconCentre - pillWidth / 2;
      labelShift = Math.max(-maxShift, Math.min(maxShift, wanted));
    }
  }

  if (!reactions || reactions.length === 0) return null;

  return (
    <View style={styles.root}>
      {/* Centred across the pill, then shifted over the hovered icon and
          clamped so it never pokes out of the pill's width. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.labelAnchor,
          {
            opacity: labelAnim,
            transform: [
              { translateX: labelShift },
              {
                translateY: labelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, LABEL_TRANSLATE_Y],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={styles.label}
          onLayout={(event) => setLabelWidth(event.nativeEvent.layout.width)}
        >
          <Typography
            variant="caption"
            style={styles.labelText}
            numberOfLines={1}
          >
            {hovered ? getChatReactionLabel(hovered) : ''}
          </Typography>
        </View>
      </Animated.View>

      <View
        style={styles.pill}
        onLayout={(event) => setPillWidth(event.nativeEvent.layout.width)}
      >
        <View
          ref={rowRef}
          style={styles.row}
          onLayout={measureRow}
          {...panRef.current.panHandlers}
        >
          {reactions.map((name, index) => {
            const active = myReaction === name;
            const lift = lifts[name];
            return (
              <Pressable
                key={name}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout;
                  slotsRef.current[index] = { name, start: x, end: x + width };
                }}
                onPressIn={() => setHoveredReaction(name)}
                onPressOut={() => {
                  if (!draggingRef.current) setHoveredReaction(null);
                }}
                onPress={() => onPickRef.current(name)}
                accessibilityRole="button"
                accessibilityLabel={`React with ${getChatReactionLabel(name)}`}
              >
                <View style={styles.reactionButton}>
                  {/* Narrowed to the active state
                      only — it used to light up on hover / touch-hover too, which
                      made a reaction look already-selected while being pressed.
                      Web keeps the halo on .reactionButton, so it stays put while
                      the icon lifts — mirrored here by leaving it un-animated. */}
                  {active ? <View style={styles.activeBackground} /> : null}

                  <Animated.View
                    style={{
                      transform: [
                        {
                          translateY: lift.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, LIFT_TRANSLATE_Y],
                          }),
                        },
                        {
                          scale: lift.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, LIFT_SCALE],
                          }),
                        },
                      ],
                    }}
                  >
                    <ReactionGlyph name={name} size={32} />
                  </Animated.View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
