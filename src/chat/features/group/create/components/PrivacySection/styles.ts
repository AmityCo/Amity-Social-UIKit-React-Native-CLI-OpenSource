// Styles for PrivacySection — ported from AmityUiKitWeb
// v4/chat/features/group/create/components/PrivacySection/PrivacySection.module.css.
// Geometry: heading padding 1.5rem 1rem 0.25rem→24/16/4; row gap 0.5rem→8;
// icon circle 2.5rem→40; text gap 0.125rem→2; banner padding 0.75rem 1rem→12/16.
// Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    privacySection: {
      flexDirection: 'column',
    },
    heading: {
      paddingTop: 24,
      paddingHorizontal: 16,
      paddingBottom: 4,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    options: {
      flexDirection: 'column',
    },
    optionRow: {
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    row: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    iconCircle: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: token(AmityColorToken.SurfaceFeaturedIconTinted),
    },
    text: {
      flex: 1,
      flexDirection: 'column',
      gap: 2,
    },
    title: {
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    description: {
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
    banner: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultHover),
    },
    bannerText: {
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
  });

  return { styles, token };
};
