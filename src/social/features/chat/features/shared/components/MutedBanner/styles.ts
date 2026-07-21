// Styles for MutedBanner — ported from MutedBanner.module.css.
// Geometry: padding 0.75rem/1rem→12/16. Text fills + centers. Colours via
// tokens, matched 1:1 to the web CSS variables (surface + text description).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceBannerSubdueGeneral),
    },
    text: {
      flex: 1,
      textAlign: 'center',
      // Web uses text-banner-subdue-textdescription-general; the cleverden SoT (717)
      // doesn't ship the Subdue text variant, so use the color-identical GreyBG variant
      // (same alias chain {Information/700}/{Information/300} → same hex). Web slug is
      // allowlisted in check-fidelity until the SoT adds the Subdue banner token.
      color: token(AmityColorToken.TextBannerGreyBGTextDescriptionGeneral),
    },
  });

  return { styles, token };
};
