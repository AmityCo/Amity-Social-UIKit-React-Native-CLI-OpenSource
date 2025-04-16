import { StyleSheet } from 'react-native';
// import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    detailWrap: {
      flex: 1,
    },
    buttonWarp: {},
  });
  return styles;
};
