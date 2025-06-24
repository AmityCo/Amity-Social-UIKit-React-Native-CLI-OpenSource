import { Dimensions, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const { width } = Dimensions.get('window');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingVertical: 20,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    base: {
      color: theme.colors.base,
    },
    cta: {
      color: theme.colors.primary,
    },
    disabled: {
      color: theme.colors.primaryShade2,
    },
    form: {
      flex: 1,
    },
    fieldContainer: {
      paddingTop: 24,
      marginHorizontal: 16,
    },
    inputContainer: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    inputContainerError: {
      borderBottomColor: theme.colors.alert,
    },
    rowContainer: {
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    baseShade1: {
      color: theme.colors.baseShade1,
    },
    divider: {
      marginTop: 24,
      marginHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    optionsContainer: {
      gap: 12,
      marginTop: 20,
    },
    pollOptionContainer: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pollOptionInputContainer: {
      flex: 1,
      borderRadius: 8,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.colors.baseShade4,
      backgroundColor: theme.colors.baseShade4,
    },
    pollOptionInputContainerError: {
      borderColor: theme.colors.alert,
    },
    pollOptionInput: {
      paddingVertical: 4,
      fontSize: 15,
      color: theme.colors.base,
    },
    errorText: {
      marginTop: 4,
      color: theme.colors.alert,
    },
    addOptionBtn: {
      width: width - 62,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.baseShade3,
    },
    addOptionText: {
      color: theme.colors.secondary,
    },
    durationButton: {
      paddingTop: 24,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    fillSpace: {
      flex: 1,
    },
    scheduleOptionContainer: {
      maxHeight: 200,
      backgroundColor: theme.colors.background,
    },
    scheduleOptionText: {
      color: theme.colors.base,
    },
    scheduleSelectorSelectStyle: {
      alignItems: 'flex-start',
      marginTop: 16,
      borderWidth: 0,
    },
    selectedTimeFrame: {
      color: theme.colors.base,
    },
    scheduleTitleStyle: {
      fontWeight: 'bold',
      fontSize: 18,
      alignSelf: 'flex-start',
      marginBottom: 20,
      color: theme.colors.base,
    },
    scheduleInitValueTextStyle: {
      color: theme.colors.base,
    },
    scheduleOptionStyle: {
      borderBottomWidth: 0,
      marginVertical: 5,
      backgroundColor: theme.colors.baseShade4,
      borderRadius: 2,
    },
    scheduleSectionStyle: {
      borderBottomWidth: 0,
    },
    scheduleSelectedItemText: {
      color: theme.colors.primary,
    },
  });

  return {
    theme,
    styles,
  };
};
