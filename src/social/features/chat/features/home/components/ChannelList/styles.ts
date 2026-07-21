// Styles for ChannelList — ported from AmityUiKitWeb ChannelList.module.css.
// Empty-state geometry mirrors the web CSS (rem → px ×16); colours resolve
// through design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    listContent: {
      flexGrow: 1,
    },
    // Swipe-to-archive visuals (web SwipeToLeft.module.css):
    // row over the action layer; action bg/icon/label via squarebutton tokens;
    // action content 5rem→80 wide, gap 0.25rem→4, padding 1rem/0.5rem→16/8.
    row: {
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    action: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      backgroundColor: token(
        AmityColorToken.SurfaceSquareButtonDefaultSecondaryDefault
      ),
    },
    actionContent: {
      width: 80,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 16,
      paddingHorizontal: 8,
    },
    actionLabel: {
      color: token(AmityColorToken.TextSquareButtonDefaultSecondaryDefault),
    },
    // web channelList__empty: column, centered, gap 0.25rem, padding 1rem.
    empty: {
      flexGrow: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: 16,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    // web channelList__emptyContent: gap 1rem, full width.
    emptyContent: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      width: '100%',
    },
    emptyText: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    emptyTitle: {
      textAlign: 'center',
      color: token(AmityColorToken.TextEmptyStateTitleDefault),
    },
    emptySubtitle: {
      textAlign: 'center',
      color: token(AmityColorToken.TextEmptyStateDescriptionDefault),
    },
  });

  return { styles, token };
};
