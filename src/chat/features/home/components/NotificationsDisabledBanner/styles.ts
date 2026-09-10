// Styles for NotificationsDisabledBanner — ported from AmityUiKitWeb
// NotificationsDisabledBanner.module.css. Geometry mirrors the web CSS
// (padding 0.75rem 1rem, gap 0.25rem, icon 1.125rem → px ×16); colours resolve
// through design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const ICON_SIZE = 18; // web 1.125rem

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceBannerSubdueGeneral),
    },
    text: {
      textAlign: 'center',
      // Web uses text-banner-subdue-textdescription-general; the cleverden SoT (717)
      // doesn't ship the Subdue text variant, so use the color-identical GreyBG variant
      // (same alias chain → same hex). Web slug allowlisted in check-fidelity.
      color: token(AmityColorToken.TextBannerSubdueTextDescriptionGeneral),
    },
  });

  return { styles, token };
};
