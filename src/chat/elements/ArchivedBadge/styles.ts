import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

// Geometry ported from AmityUiKitWeb ArchivedBadge.module.css (rem -> px, x16):
// height 1rem=16, min-width 1.375rem=22, padding 0 0.25rem=4, radius 1.25rem=20;
// icon 0.75rem=12; text padding 0 0.125rem=2, font 0.625rem=10 / line 0.8125rem=13.
export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 16,
      minWidth: 22,
      paddingHorizontal: 4,
      borderRadius: 20,
      backgroundColor: token(
        AmityColorToken.SurfaceBadgeSemanticBadgeChatArchived
      ),
      overflow: 'hidden',
    },
    text: {
      paddingHorizontal: 2,
      fontSize: 10,
      lineHeight: 13,
      color: token(AmityColorToken.TextBadgeSemanticBadgeChatArchivedDefault),
    },
  });

  return { styles };
};
