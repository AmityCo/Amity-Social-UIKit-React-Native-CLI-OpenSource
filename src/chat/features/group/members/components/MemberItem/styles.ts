// Styles for MemberItem — ported from AmityUiKitWeb MemberItem.module.css.
// Geometry mirrors the create UserItem: gap 0.5rem→8, padding 8/16, height 56,
// name-row gap 0.125rem→2. Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    memberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 8,
      width: '100%',
      paddingVertical: 8,
      paddingHorizontal: 16,
      height: 56,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    nameRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      minWidth: 0,
    },
    name: {
      flexShrink: 1,
      minWidth: 0,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    youSuffix: {
      flexShrink: 0,
      marginLeft: 2,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    trailing: {
      flexShrink: 0,
    },
    skeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      height: 56,
    },
  });

  return { styles, token };
};
