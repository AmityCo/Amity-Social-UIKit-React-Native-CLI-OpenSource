import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    typography__headline: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 24,
      color: theme.colors.base,
    },
    typography__titleBold: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 24,
      color: theme.colors.base,
    },
    typography__title: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 24,
      color: theme.colors.base,
    },
    typography__bodyBold: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 20,
      color: theme.colors.base,
    },
    typography__body: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
      color: theme.colors.base,
    },
    typography__captionBold: {
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
      color: theme.colors.base,
    },
    typography__caption: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
      color: theme.colors.base,
    },
    typography__captionSmall: {
      fontSize: 10,
      fontWeight: '400',
      lineHeight: 13,
      color: theme.colors.base,
    },
  });

  return { styles };
};
