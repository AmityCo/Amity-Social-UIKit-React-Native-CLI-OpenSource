import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
      backgroundColor: '#000000',
    },
    steamEndContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    indicator: {
      left: 16,
      zIndex: 1,
      top: insets.top + 20,
      position: 'absolute',
    },
    status: {
      borderRadius: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.live,
    },
    live: {
      color: theme.colors.background,
    },
    control: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0,
      zIndex: 10,
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    controlVisible: {
      opacity: 1,
    },
    controller: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      zIndex: 1,
      right: 16,
      top: insets.top + 20,
      position: 'absolute',
    },
    connecting: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      gap: 12,
      zIndex: 100,
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    reconnectingText: {
      textAlign: 'center',
      color: theme.colors.background,
    },
    text: {
      color: theme.colors.background,
    },
  });

  return {
    theme,
    styles,
  };
};
