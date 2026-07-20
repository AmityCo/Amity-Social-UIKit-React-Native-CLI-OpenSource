// Styles for MutedBanner — ported from MutedBanner.module.css.
// Geometry: padding 0.75rem/1rem→12/16. Text fills + centers. Colours via
// tokens. NOTE: the web text token `text-banner-subdue-textdescription-general`
// has no 1:1 RN name (the RN token schema renamed the Banner *text* group to
// GreyBG/WhiteBG while keeping the "Subdue" *surface"); this follows the existing
// NotificationsDisabledBanner precedent of pairing SurfaceBannerSubdueGeneral
// with TextBannerGreyBGTextDescriptionGeneral.

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
      color: token(AmityColorToken.TextBannerGreyBGTextDescriptionGeneral),
    },
  });

  return { styles, token };
};
