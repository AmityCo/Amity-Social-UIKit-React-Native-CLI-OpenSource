// ReactionPicker — RN port of AmityUiKitWeb v4/chat/elements/ReactionPicker.
// The horizontal reactions row shown in the message action popover. Tapping a
// reaction fires onReactionClick (+ onSelectReaction), matching web. The active
// reaction shows the reactionstate-active circle; the reaction name floats above
// on press (web shows it on hover — RN has no hover, so it surfaces on press-in).
//
// RN adaptations from web:
//   - Web reads the reaction set from CustomReactionProvider; RN has no runtime
//     accessor for the top-level `message_reactions` config, so it defaults to
//     DEFAULT_MESSAGE_REACTIONS (overridable via the `reactions` prop).
//   - Web renders reaction.image URLs; RN renders the ported ReactionGlyph art.
//   - Web hover/touch-hover drag + above/below label flip are web-only
//     interactions and are omitted.

// 1. React / RN imports
import { Pressable, View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { resolveString } from '../../../../../core/localization';
import {
  DEFAULT_MESSAGE_REACTIONS,
  ReactionGlyph,
} from '../../features/shared/utils/reactionIcons';
import { useStyles } from './styles';

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

  if (!reactions || reactions.length === 0) return null;

  const onClickReaction = (reactionName: string) => {
    onReactionClick(reactionName);
    onSelectReaction?.(reactionName);
  };

  return (
    <View style={styles.pill}>
      <View style={styles.row}>
        {reactions.map((name) => {
          const active = myReaction === name;
          return (
            <Pressable
              key={name}
              onPress={() => onClickReaction(name)}
              accessibilityRole="button"
              accessibilityLabel="Reaction picker"
            >
              {({ pressed }) => (
                <View style={styles.reactionButton}>
                  {pressed ? (
                    <View style={styles.label}>
                      <Typography variant="caption" style={styles.labelText}>
                        {getChatReactionLabel(name)}
                      </Typography>
                    </View>
                  ) : null}
                  {/* PDT-4143 (web PR 1822) narrowed this to the active state
                      only — it used to light up on hover / touch-hover too, which
                      made a reaction look already-selected while being pressed.
                      The floating label above still follows the press. */}
                  {active ? <View style={styles.activeBackground} /> : null}
                  <ReactionGlyph name={name} size={32} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
