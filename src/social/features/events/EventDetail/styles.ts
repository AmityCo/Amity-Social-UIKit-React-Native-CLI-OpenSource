import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topBar: {
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      position: 'absolute',
      paddingTop: insets.top,
    },
    topBarRow: {
      gap: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    topBarLeft: {
      gap: 12,
      width: '80%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    topBarTitle: {
      flexShrink: 1,
      color: '#FFFFFF',
    },
    circleButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cover: {
      width: '100%',
      aspectRatio: 16 / 9,
      overflow: 'hidden',
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    tabList: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    fallbackContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
    },
    fallbackText: {
      marginTop: 8,
      textAlign: 'center',
      color: theme.colors.baseShade3,
    },
    fallbackLink: {
      marginTop: 16,
      color: theme.colors.primary,
    },
  });

  return { styles, theme, insets };
};
