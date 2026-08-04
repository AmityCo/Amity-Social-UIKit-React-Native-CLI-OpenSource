// Styles for the select-group-member UserItem — ported from AmityUiKitWeb
// v4/chat/features/group/select-member/components/UserItem/UserItem.module.css.
// Geometry: gap 0.5rem→8, name-row gap 0.125rem→2, skeleton padding 0.5rem 1rem→8/16,
// skeleton height 3.5rem→56. Row padding lives on the wrapping Selection.Checkbox.
// Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    userItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    nameRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    name: {
      flexShrink: 1,
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
