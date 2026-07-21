import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';

// Geometry ported from AmityUiKitWeb GroupNameField.module.css (rem -> px, x16):
// full width, padding 1.5rem 1rem 0 = 24 top / 16 horizontal / 0 bottom.
// Input.Text has no style/className prop, so the padding lives on a wrapper View.
export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingTop: 24,
      paddingHorizontal: 16,
    },
  });

  return { styles, token };
};
