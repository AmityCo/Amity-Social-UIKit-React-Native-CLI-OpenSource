import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 16,
    },
    header: {
      marginBottom: 4,
    },
    baseShade2: {
      color: theme.colors.baseShade2,
    },
    optionGroup: {
      gap: 8,
    },
    option: {
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.baseShade4,
      gap: 8,
    },
    optionSelected: {
      borderColor: theme.colors.primary,
    },
    optionLabel: {
      flex: 1,
    },
    optionLabelDisabled: {
      color: theme.colors.baseShade3,
    },
    seeMoreOptionsBtn: {
      marginTop: 16,
    },
    voteBtn: {
      marginTop: 12,
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    voteBtnDisabled: {
      backgroundColor: theme.colors.primaryShade3,
    },
    voteBtnLabel: {
      color: theme.colors.background,
    },
    footer: {
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    pollInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    seeResultsBtnLabel: {
      color: theme.colors.primary,
      padding: 0,
    },
    pollResults: {
      gap: 8,
    },
    optionResult: {
      padding: 12,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.baseShade4,
    },
    topOptionResult: {
      borderColor: theme.colors.primary,
    },
    optionResultHeader: {
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionResultLabel: {
      flex: 1,
      color: theme.colors.base,
    },
    optionResultPercentage: {
      color: theme.colors.baseShade1,
    },
    topOptionResultPercentage: {
      color: theme.colors.primary,
    },
    optionResultVoters: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionAvatar: {
      width: 16,
      height: 16,
      borderRadius: 100,
      marginLeft: 4,
    },
    optionResultProgressBar: {
      height: 8,
      marginTop: 8,
      borderRadius: 100,
      position: 'relative',
      backgroundColor: theme.colors.baseShade4,
    },
    topOptionResultProgressBar: {
      backgroundColor: theme.colors.primaryShade3,
    },
    optionResultProgressBarLength: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      height: 8,
      borderRadius: 100,
      position: 'absolute',
      backgroundColor: theme.colors.baseShade1,
    },
    topOptionResultProgressBarLength: {
      backgroundColor: theme.colors.primary,
    },
  });

  return {
    styles,
    theme,
  };
};
