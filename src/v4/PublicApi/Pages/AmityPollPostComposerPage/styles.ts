import { Dimensions, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../providers/amity-ui-kit-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const { width } = Dimensions.get('window');
  const { bottom } = useSafeAreaInsets();

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
      flexGrow: 1,
      paddingBottom: bottom + 24,
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
      marginBottom: 4,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    pickDateTimeButton: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fillSpace: {
      flex: 1,
    },
    bottomSheet: {
      backgroundColor: theme.colors.background,
    },
    androidDateTimeContainer: {
      gap: 12,
      paddingTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    androidDateTimeButton: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.baseShade4,
    },
    iOSDateTimePicker: {
      height: 600,
    },
    iOSDateTimeHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomColor: theme.colors.baseShade4,
      borderBottomWidth: 1,
    },
  });

  return {
    theme,
    styles,
  };
};
