import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { MenuActionProps } from '../MenuAction';

export const useStyles = ({
  gap,
  dark,
}: Pick<MenuActionProps, 'gap' | 'dark'>) => {
  const theme = useTheme<MyMD3Theme>();
  const gapSize = { small: 12, medium: 16 };

  const styles = StyleSheet.create({
    container: {
      gap: gapSize[gap],
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      color: dark ? theme.colors.white : theme.colors.base,
    },
    alert: {
      color: theme.colors.alert,
    },
  });

  return {
    theme,
    styles,
  };
};
