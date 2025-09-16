import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    optionPressed: {
      opacity: 0.7,
    },
  });

  return { styles, theme };
};
