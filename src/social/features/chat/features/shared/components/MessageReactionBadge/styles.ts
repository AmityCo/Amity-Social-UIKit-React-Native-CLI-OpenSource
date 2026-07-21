// Styles for MessageReactionBadge — ported from AmityUiKitWeb
// v4/chat/features/shared/components/MessageReactionBadge/MessageReactionBadge.module.css.
// rem→px ×16. Colours resolve through AmityColorToken.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = (containsMyReaction: boolean) => {
  const token = useToken();

  // Web `.messageReactionBadge[data-contains-my-reaction='true']` swaps the
  // surface + border; both token refs are kept in source so either state is
  // reachable (and the fidelity gate sees both).
  const surface = containsMyReaction
    ? token(AmityColorToken.SurfaceReactionsReactionCountActive)
    : token(AmityColorToken.SurfaceReactionsReactionCountDefault);
  const border = containsMyReaction
    ? token(AmityColorToken.BorderReactionReactionCountActive)
    : token(AmityColorToken.BorderReactionReactionCountDefault);
  const countColor = containsMyReaction
    ? token(AmityColorToken.TextReactionsChatReactionCountActive)
    : token(AmityColorToken.TextReactionsChatReactionCountDefault);

  const styles = StyleSheet.create({
    // .messageReactionBadge
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 2,
      height: 28,
      marginTop: -6,
      paddingVertical: 4,
      paddingHorizontal: 6,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 24,
      backgroundColor: surface,
    },
    // .messageReactionBadge__stack
    stack: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 8,
    },
    // .messageReactionBadge__icon — 20×20 atom circle behind each glyph.
    icon: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      marginRight: -8,
      borderRadius: 9999,
      backgroundColor: token(AmityColorToken.BorderReactionReactionAtomDefault),
    },
    // .messageReactionBadge__count
    count: {
      fontSize: 13,
      lineHeight: 18,
      color: countColor,
    },
  });

  return { styles };
};
