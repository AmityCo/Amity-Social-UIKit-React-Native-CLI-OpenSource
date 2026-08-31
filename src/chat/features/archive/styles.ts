// Styles for ArchivedChat — ported from ArchivedChat.module.css.
// Web: column, bg surface-page-background-default, min-height 100svh → flex:1.
// Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    archivedChat: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
  });

  return { styles, token };
};
