import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyle = (themeStyle: MyMD3Theme) => {
  const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: 200,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      gap: 12,
    },
    icon: {
      width: 24,
      height: 24,
      tintColor: themeStyle.colors.base,
    },
    label: {
      color: themeStyle.colors.base,
      fontWeight: '600',
      fontSize: 15,
      lineHeight: 20,
    },
  });
  return styles;
};
