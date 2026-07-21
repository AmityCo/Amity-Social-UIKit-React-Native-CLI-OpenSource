import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

// Geometry ported from AmityUiKitWeb SettingMenu.module.css (rem -> px, x16):
// row padding 1rem=16, gap 0.5rem=8; leading gap 0.75rem=12; icon badge 2rem=32
// (padding 0.25rem=4, radius 0.5rem=8); icon 1.5rem=24; chevron 1.5rem=24;
// trailing gap 0.5rem=8.
export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      width: '100%',
      padding: 16,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    leading: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      overflow: 'hidden',
    },
    iconBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      padding: 4,
      borderRadius: 8,
      backgroundColor: token(AmityColorToken.SurfaceFeaturedIconTinted),
    },
    label: {
      flexShrink: 1,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    destructiveLabel: {
      color: token(AmityColorToken.TextListHeaderDestructiveDefault),
    },
    trailing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    trailingText: {
      color: token(AmityColorToken.TextListTrailingTextGeneral),
    },
  });

  return { styles, token };
};
