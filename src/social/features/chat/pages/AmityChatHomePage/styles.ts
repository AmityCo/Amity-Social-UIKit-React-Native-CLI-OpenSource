// Styles for AmityChatHomePage — the full-screen wrapper around ChatHome.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
  });

  return { styles };
};
