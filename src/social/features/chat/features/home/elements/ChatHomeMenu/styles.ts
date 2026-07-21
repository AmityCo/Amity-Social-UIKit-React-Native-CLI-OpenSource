// Styles for ChatHomeMenu — the filled "⋯" icon button.
// Web: Button.Icon styleType="filled" hierarchy="secondary" size 32 (EllipsisV).
// Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled
      ),
    },
  });

  return { styles, token };
};
