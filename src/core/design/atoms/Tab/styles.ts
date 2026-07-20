import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';
import type { TabVariant } from './Tab';

// Geometry from SoT (geometry.json → tabs), px:
//   pill:       height 40, padding 8×12, radius 24, border 1, fontSize 17, lineHeight 24
//   underlined: height 56, paddingTop 16, gap 14, indicator thickness 2
//   icon:       height 56, paddingTop 16, gap 14, glyph 24×24, indicator 24×2
export const useStyles = (
  variant: TabVariant,
  active: boolean,
  disabled: boolean
) => {
  const token = useToken();

  const labelColor =
    variant === 'pill'
      ? token(
          disabled
            ? AmityColorToken.TextTabPillDisabled
            : active
            ? AmityColorToken.TextTabPillActive
            : AmityColorToken.TextTabPillDefault
        )
      : token(
          disabled
            ? AmityColorToken.TextTabUnderlinedDisabled
            : active
            ? AmityColorToken.TextTabUnderlinedActive
            : AmityColorToken.TextTabUnderlinedDefault
        );

  const iconColor = token(
    disabled
      ? AmityColorToken.IconTabDisabled
      : active
      ? AmityColorToken.IconTabActive
      : AmityColorToken.IconTabDefault
  );

  const indicatorColor = !active
    ? 'transparent'
    : variant === 'icon'
    ? token(AmityColorToken.LineTabIconActive)
    : token(AmityColorToken.LineTabUnderlinedActive);

  const pillSurface = token(
    disabled
      ? AmityColorToken.SurfaceTabPillDisabled
      : active
      ? AmityColorToken.SurfaceTabPillActive
      : AmityColorToken.SurfaceTabPillDefault
  );
  const pillBorder = token(
    disabled
      ? AmityColorToken.BorderTabPillDisabled
      : active
      ? AmityColorToken.BorderTabPillActive
      : AmityColorToken.BorderTabPillDefault
  );

  const tab =
    variant === 'pill'
      ? {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          height: 40,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: pillBorder,
          backgroundColor: pillSurface,
        }
      : {
          flexDirection: 'column' as const,
          alignItems: 'center' as const,
          gap: 14,
          height: 56,
          paddingTop: 16,
          backgroundColor: 'transparent' as const,
        };

  const styles = StyleSheet.create({
    tab,
    label: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: active ? '600' : '400',
      color: labelColor,
    },
    icon: {
      width: 24,
      height: 24,
    },
    indicator:
      variant === 'icon'
        ? { width: 24, height: 2, backgroundColor: indicatorColor }
        : {
            width: '100%' as const,
            height: 2,
            backgroundColor: indicatorColor,
          },
  });

  return { styles, iconColor };
};
