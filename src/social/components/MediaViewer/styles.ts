import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      height: 56,
      zIndex: 2,
    },
    headerBtn: {
      minWidth: 44,
      height: 44,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    headerBtn__right: {
      minWidth: 44,
      height: 44,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    counter: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    muteGlyph: {
      fontSize: 20,
    },
    page: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    media: {
      width: '100%',
      height: '100%',
    },
  });

  return { styles, theme };
};
