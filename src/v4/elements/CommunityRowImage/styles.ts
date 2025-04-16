import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    container: {
      width: 80,
      height: 80,
      borderRadius: 4,
    },
    placeholder: {
      backgroundColor: theme.colors.secondaryShade3,
      width: '100%',
      height: '100%',
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    label: {
      color: 'white',
    },
    gradientLayer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: 4,
      backgroundColor: '#000000',
    },
  });
  return styles;
};
