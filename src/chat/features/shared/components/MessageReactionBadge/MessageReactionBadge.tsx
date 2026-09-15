// MessageReactionBadge — RN port of AmityUiKitWeb
// v4/chat/features/shared/components/MessageReactionBadge/MessageReactionBadge.tsx.
// The small reaction-count pill shown on a message bubble: up to 3 overlapping
// reaction glyphs (highest count first) + the abbreviated total. Tapping it
// opens the reactor list. Hidden when there are no reactions or the message is
// deleted. `data-contains-my-reaction` (web) → the `containsMyReaction` styling.

// 1. React / RN imports
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { abbreviateCount } from '../../../../../core/utils/abbreviateCount';
import { ReactionGlyph } from '../../utils/reactionIcons';
import { useStyles } from './styles';

// Web imports this from v4/chat/constants (MAX_REACTION_BADGE_ICONS = 3).
const MAX_REACTION_BADGE_ICONS = 3;

// 3. Types
type MessageReactionBadgeProps = {
  message: Amity.Message;
  onTap: () => void;
};

// 4. Named function component
export function MessageReactionBadge({
  message,
  onTap,
}: MessageReactionBadgeProps) {
  const reactionMap =
    (message.reactions as Record<string, number> | undefined) ?? {};
  const totalCount = message.reactionsCount ?? 0;
  const containsMyReaction = (message.myReactions?.length ?? 0) > 0;

  const { styles } = useStyles(containsMyReaction);

  const sortedNames = useMemo(() => {
    return Object.entries(reactionMap)
      .filter(([, count]) => count > 0)
      .sort((a, b) => (a[1] === b[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]))
      .slice(0, MAX_REACTION_BADGE_ICONS)
      .map(([name]) => name);
  }, [message.reactions]);

  if (totalCount === 0 || message.isDeleted) return null;

  return (
    <Pressable
      style={styles.container}
      onPress={onTap}
      accessibilityRole="button"
      accessibilityLabel={`View ${totalCount} reactions`}
    >
      <View style={styles.stack}>
        {sortedNames.map((name, index) => (
          <View
            key={`${name}-${index}`}
            style={[styles.icon, { zIndex: MAX_REACTION_BADGE_ICONS - index }]}
          >
            {/* .messageReactionBadge__iconSvg — 1.125rem = 18px */}
            <ReactionGlyph name={name} size={18} />
          </View>
        ))}
      </View>
      <Typography variant="captionBold" style={styles.count}>
        {abbreviateCount(totalCount)}
      </Typography>
    </Pressable>
  );
}
