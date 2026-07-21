// Styles for DisabledByModeratorBanner — ported from AmityUiKitWeb
// v4/chat/features/group/notification-preference/components/DisabledByModeratorBanner/DisabledByModeratorBanner.module.css.
// rem → px×16; colours via design tokens (no hardcoded hex). The Subdue banner
// surface has a direct RN token; the icon/text Subdue colours use the
// colour-identical GreyBG variants (see fidelity allowlist).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .disabledByModeratorBanner — centered row, 0.25rem gap, 0.75rem/1rem padding.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceBannerSubdueGeneral),
    },
    // .disabledByModeratorBanner__text — centered caption.
    text: {
      color: token(AmityColorToken.TextBannerGreyBGTextDescriptionGeneral),
      textAlign: 'center',
    },
  });

  return { styles, token };
};
