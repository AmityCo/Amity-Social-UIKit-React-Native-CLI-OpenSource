import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    chipTabList: {
      gap: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    chipTab: {
      borderWidth: 1,
      borderRadius: 24,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderColor: theme.colors.baseShade4,
      backgroundColor: theme.colors.background,
    },
    activeChipTab: {
      backgroundColor: theme.colors.primary,
    },
    chipTabText: {
      color: theme.colors.baseShade1,
    },
    activeChipTabText: {
      color: theme.colors.background,
    },

    underlineTabList: {
      gap: 20,
      paddingTop: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      borderBottomColor: theme.colors.baseShade4,
      borderBottomWidth: 1,
    },
    underlineTab: {
      paddingBottom: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeUnderlineTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    underlineTabText: {
      color: theme.colors.baseShade2,
    },
    activeUnderlineTabText: {
      color: theme.colors.primary,
    },
  });

  return {
    styles,
    theme,
  };
};
