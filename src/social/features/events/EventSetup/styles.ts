import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      gap: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    headerButton: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSpacer: {
      width: 24,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      color: theme.colors.base,
    },
    headerSubtitle: {
      color: theme.colors.baseShade1,
    },
    form: {
      padding: 16,
      gap: 24,
    },
    coverImageContainer: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.baseShade4,
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    coverImageOverlay: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cameraIcon: {
      width: 20,
      height: 20,
    },
    field: {
      gap: 8,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      color: theme.colors.base,
    },
    counter: {
      color: theme.colors.baseShade1,
    },
    input: {
      fontSize: 15,
      paddingVertical: 10,
      color: theme.colors.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    multilineInput: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    rowBetween: {
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowLabel: {
      color: theme.colors.base,
    },
    rowValue: {
      color: theme.colors.baseShade1,
    },
    dateTimeButtons: {
      gap: 8,
      flexDirection: 'row',
    },
    dateTimeButton: {
      borderRadius: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.baseShade4,
    },
    dateTimeButtonText: {
      color: theme.colors.base,
    },
    radioRow: {
      gap: 12,
      paddingVertical: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    radioTextContainer: {
      flex: 1,
    },
    radioLabel: {
      color: theme.colors.base,
    },
    radioDescription: {
      color: theme.colors.baseShade1,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.baseShade2,
    },
    radioOuterActive: {
      borderColor: theme.colors.primary,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
    },
    hint: {
      color: theme.colors.baseShade1,
    },
    submitContainer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.baseShade4,
    },
    submitButton: {
      gap: 8,
      width: '100%',
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.primaryShade2 ?? theme.colors.baseShade3,
    },
    submitButtonText: {
      color: '#FFFFFF',
    },
  });

  return { styles, theme };
};
