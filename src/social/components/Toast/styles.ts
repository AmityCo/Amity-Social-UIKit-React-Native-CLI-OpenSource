import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

export const useStyles = (
  bottomPosition: number = 16,
  variant: 'default' | 'custom' = 'default'
) => {
  const theme = useTheme<MyMD3Theme>();
  const { bottom } = useSafeAreaInsets();
  const token = useToken();

  // Custom variant: the dark pill used by chat notifications, bound to the
  // CustomToast design tokens (Surface/Text/Icon CustomToast). Default variant
  // keeps the app-wide toast appearance (react-native-paper theme).
  const isCustom = variant === 'custom';

  const styles = StyleSheet.create({
    toast: {
      gap: 12,
      zIndex: 999,
      width: '90%',
      borderRadius: 8,
      bottom: bottom + bottomPosition,
      paddingVertical: 16,
      alignSelf: 'center',
      flexDirection: 'row',
      position: 'absolute',
      alignItems: 'center',
      paddingHorizontal: 12,
      backgroundColor: isCustom
        ? token(AmityColorToken.SurfaceCustomToastDefaultDefault)
        : theme.colors.base,
      ...(isCustom ? { minHeight: 56 } : null),
    },
    message: {
      flex: 1,
      color: isCustom
        ? token(AmityColorToken.TextCustomToastDefault)
        : theme.colors.background,
    },
  });

  return {
    theme,
    styles,
    iconColor: isCustom
      ? token(AmityColorToken.IconCustomToastDefault)
      : theme.colors.background,
  };
};
