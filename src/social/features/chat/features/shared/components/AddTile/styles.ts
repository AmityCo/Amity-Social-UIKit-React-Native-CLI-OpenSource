// Styles for AddTile — ported from AddTile.module.css.
// Geometry: column, center, gap 0.25rem→4, tile width 4rem→64. The web
// Button.Icon (filled secondary, 40px, circular) has no 1:1 RN atom, so the
// tile renders a 40px circular Pressable tinted by the filled-secondary
// iconbutton tokens. Label colour from Text/IconButton/Label/General.

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
    button: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled
      ),
    },
    name: {
      maxWidth: 64,
      textAlign: 'center',
      color: token(AmityColorToken.TextIconButtonLabelGeneral),
    },
  });

  return { styles, token };
};
