// Styles for AmityGroupMemberActionComponent. Member actions render in the global
// bottom sheet (RN mobile adaptation; web uses a desktop popover). The drawer Menu
// rows have 0 horizontal padding, so the sheet wrapper adds the 16px inset + a
// bottom inset — mirroring the sibling AmityConversationChatUserActionComponent.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    sheetContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  });

  return { styles, token };
};
