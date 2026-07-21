// Styles for the add-member UserList — the checkbox rows mirror the create
// UserItem geometry (gap 8, padding 8/16, height 56).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    userList: {
      flex: 1,
    },
    rowContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      minWidth: 0,
    },
    name: {
      flexShrink: 1,
      minWidth: 0,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
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
