// Styles for YouTile — ported from YouTile.module.css.
// Geometry: column, center, gap 0.25rem→4, tile width 4rem→64. Label colour
// from Text/Avatar/Label/Default.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    tile: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      width: 64,
    },
    name: {
      maxWidth: 64,
      textAlign: 'center',
      color: token(AmityColorToken.TextAvatarLabelDefault),
    },
  });

  return { styles, token };
};
