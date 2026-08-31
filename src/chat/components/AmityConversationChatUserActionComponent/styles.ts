// Styles for AmityConversationChatUserActionComponent.
// RN mobile adaptation: web presents the 1-1 user-action menu in a desktop
// Popover; RN presents it in a native bottom sheet (the repo's global @devvie
// BottomSheetComponent). The sheet body reuses the SoT `Menu` in its `drawer`
// container, which renders rows with paddingHorizontal 0 — so this wrapper adds
// the drawer's page side-padding (1rem → 16) plus a bottom inset.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // Bottom-sheet body wrapper around the drawer-variant Menu.
    sheetContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
  });

  return { styles, token };
};
