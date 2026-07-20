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
