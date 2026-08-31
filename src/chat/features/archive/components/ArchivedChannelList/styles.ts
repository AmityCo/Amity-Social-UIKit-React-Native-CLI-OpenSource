// Styles for ArchivedChannelList — ported from ArchivedChannelList.module.css
// (flex column list) plus the swipe-action visuals from SwipeToLeft.module.css:
//   action bg      → --asc-color-surface-squarebutton-default-secondary-default
//   action content → width 5rem→80, gap 0.25rem→4, padding 1rem 0.5rem→16/8
//   action icon    → --asc-color-icon-squarebutton-default-secondary-default
//   action label   → --asc-color-text-squarebutton-default-secondary-default
//                    (0.8125rem/600 → captionBold)
//   row background → --asc-color-surface-page-background-default
// Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

const ACTION_WIDTH = 80;

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    archivedChannelList: {
      flex: 1,
      flexDirection: 'column',
    },
    listContent: {
      flexGrow: 1,
    },
    // swipeToLeft__row: opaque row over the action layer.
    row: {
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    // swipeToLeft__action: the revealed background behind the row.
    action: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      backgroundColor: token(
        AmityColorToken.SurfaceSquareButtonDefaultSecondaryDefault
      ),
    },
    // swipeToLeft__actionContent: 5rem-wide centered icon + label column.
    actionContent: {
      width: ACTION_WIDTH,
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
  });

  return { styles, token };
};
