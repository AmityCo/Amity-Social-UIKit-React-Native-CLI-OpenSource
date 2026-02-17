import { StyleSheet } from 'react-native';
import type { MyMD3Theme } from '~/core/providers/AmityUIKitProvider';

export const useStyles = (theme: MyMD3Theme) => {
  const styles = StyleSheet.create({
    memberText: {
      color: theme.colors.baseShade1,
    },
  });
  return styles;
};
