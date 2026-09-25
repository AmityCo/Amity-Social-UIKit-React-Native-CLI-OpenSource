// Styles for AmitySearchChannelResults + its local SwipeToLeft helper.
// The list surface mirrors the home ChannelList; the swipe action geometry is
// ported from AmityUiKitWeb SwipeToLeft.module.css (rem → px ×16):
//   actionContent width 5rem→80, gap 0.25rem→4, padding 1rem 0.5rem→16/8,
//   label font-size 0.8125rem→13, weight 600, line-height 1.125rem→18.
// The action's square-button secondary colours port 1:1 to the RN SquareButton
// default-secondary surface/text tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

const ACTION_WIDTH = 80;

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
    // web swipeToLeft__actionContent: right-aligned 5rem panel, centered column.
    swipeAction: {
      width: ACTION_WIDTH,
      backgroundColor: token(
        AmityColorToken.SurfaceSquareButtonDefaultSecondaryDefault
      ),
    },
    swipeActionContent: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 16,
      paddingHorizontal: 8,
    },
    swipeActionLabel: {
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
      letterSpacing: -0.065,
      textAlign: 'center',
      color: token(AmityColorToken.TextSquareButtonDefaultSecondaryDefault),
    },
  });

  return { styles, token };
};
