// Styles for the select-group-member Header — ported from AmityUiKitWeb
// v4/chat/features/group/select-member/components/Header/Header.module.css.
// Geometry: search bar padding 0.5rem 1rem→8/16. Web `position: sticky` has no
// RN equivalent and is dropped. Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'column',
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    searchBar: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  });

  return { styles, token };
};
