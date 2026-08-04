// Styles for the select-group-member UserList — ported from AmityUiKitWeb
// v4/chat/features/group/select-member/components/UserList/UserList.module.css.
// The web list is a flex column; RN uses a FlatList that fills its parent.
// Web's `.userList__row[data-hovered]` background maps to the RN row's PRESSED
// background (same `surface-list-default-hover` token).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    userList: {
      flex: 1,
    },
    rowPressed: {
      backgroundColor: token(AmityColorToken.SurfaceListDefaultHover),
    },
  });

  return { styles };
};
