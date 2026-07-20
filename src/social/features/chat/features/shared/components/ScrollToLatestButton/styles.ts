// Styles for ScrollToLatestButton — ported from ScrollToLatestButton.module.css
// plus the web Button.Icon (size 40, filled/secondary) geometry.
// Pinned right 1rem→16, bottom 0.5rem→8; 40×40 circle (radius 20). box-shadow
// dropped (RN, no hex allowed). Colours via IconButton/Filled/Secondary tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    button: {
      position: 'absolute',
      right: 16,
      bottom: 8,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled
      ),
    },
  });

  return { styles, token };
};
