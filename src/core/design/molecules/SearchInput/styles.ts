import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

// SearchInput leans on the Boxed atom for the field chrome; only the trailing
// clear button needs local layout (web SearchInput.module.css clearButton:
// 1.25rem = 20 square, centred). Icon tint uses the shared TextInput icon token.
export const ICON_TOKEN = AmityColorToken.IconInputTextInputDefault;

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    clearButton: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return { styles, token };
};
