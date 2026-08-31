import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 24,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    text: { alignItems: 'center', maxWidth: 252 },
    title: {
      color: token(AmityColorToken.TextEmptyStateTitleDefault),
      textAlign: 'center',
    },
    subtitle: {
      color: token(AmityColorToken.TextEmptyStateDescriptionDefault),
      textAlign: 'center',
    },
  });
  return { styles, token };
};
