import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

type UseStylesArgs = {
  isDanger?: boolean;
};

// Web geometry (MenuOptionButton.module.css, rem × 16).
export const useStyles = ({ isDanger = false }: UseStylesArgs) => {
  const token = useToken();

  // Web primitives base-default / alert-default map to the closest semantic
  // tokens in the RN model: Text/Base/Default and Text/Base/Alert.
  const colorToken = isDanger
    ? AmityColorToken.TextBaseAlert
    : AmityColorToken.TextListHeaderDefaultDefault;

  const styles = StyleSheet.create({
    menuOptionButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12, // 0.75rem
      paddingVertical: 12, // 0.75rem
      paddingHorizontal: 16, // 1rem
    },
    text: {
      flex: 1,
      color: token(colorToken),
    },
  });

  return { styles, token, colorToken };
};
