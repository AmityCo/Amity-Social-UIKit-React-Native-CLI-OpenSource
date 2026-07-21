// Styles for the RN TextEditor. Geometry mirrors the composer input surface
// (web MessageComposer.module.css): radius 1.25rem→20, padding 0.625rem 0.75rem
// →10/12, min-height 2.5rem→40, editor font 1rem/1.25rem→16/20. All colours
// resolve through design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      minWidth: 0,
      backgroundColor: token(AmityColorToken.SurfaceInputBoxedInputDefault),
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 12,
      minHeight: 40,
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      fontSize: 16,
      lineHeight: 20,
      padding: 0,
      // Web composer editor uses text-input-textinput-placeholder-enabled-filled for
      // typed text; that token flips (dark-grey in light mode, white in dark). Its RN
      // path is ".../Placeholder/Enabled-Filled" (Enabled-Filled is ONE hyphenated
      // segment — guessing "Enabled/Filled" resolves to the missing sentinel).
      color: token(AmityColorToken.TextInputTextInputPlaceholderEnabledFilled),
    },
  });

  const placeholderColor = token(
    AmityColorToken.TextInputTextInputPlaceholderEnabled
  );

  return { styles, token, placeholderColor };
};
