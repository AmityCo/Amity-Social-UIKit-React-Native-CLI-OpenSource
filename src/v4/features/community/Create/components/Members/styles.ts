import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    container: {
      paddingBottom: 16,
    },
    memberContainer: {
      gap: 16,
      flexWrap: 'wrap',
      paddingVertical: 16,
      flexDirection: 'row',
    },
    selectedMemberContainer: {
      width: '20%',
      alignItems: 'center',
    },
  });

  return {
    theme,
    styles,
  };
};
