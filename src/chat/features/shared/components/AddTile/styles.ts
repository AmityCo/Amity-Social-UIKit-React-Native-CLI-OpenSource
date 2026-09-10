// Styles for AddTile — ported from AddTile.module.css.
// Geometry: column, center, gap 0.25rem→4, tile width 4rem→64. The plus button
// is the Button.Icon atom rendered borderless (transparent/primary/40 — a
// deviation from web's filled-secondary, per user intent); this style covers
// only the tile layout + label. Label colour from Text/IconButton/Label/General.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

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
      color: token(AmityColorToken.TextIconButtonLabelGeneral),
    },
  });

  return { styles, token };
};
