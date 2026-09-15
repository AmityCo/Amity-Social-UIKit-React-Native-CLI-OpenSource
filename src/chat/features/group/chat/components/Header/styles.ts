// Geometry from web group/chat Header.module.css: gap 0.5rem→8, padding
// 0.625rem 1rem→10/16, avatar 2.5rem→40, name 1.0625rem/1.5rem→17/24 weight 600
// letterSpacing -0.0256rem→-0.4. Colours via design tokens.
import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();
  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
      borderBottomWidth: 1,
      borderBottomColor: token(AmityColorToken.LineDividerPostDefault),
    },
    identityButton: { flex: 1, minWidth: 0 },
    identity: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: { width: 40, height: 40, flexShrink: 0 },
    title: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    name: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '600',
      letterSpacing: -0.4,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    subtitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    subtitleText: {
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
  });
  return { styles, token };
};
