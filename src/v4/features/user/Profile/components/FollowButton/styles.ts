import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;

  const styles = StyleSheet.create({
    followIcon: {
      width: 18,
      height: 16,
    },
    userProfileFollowButton: {
      borderWidth: 1,
      borderColor: '#A5A9B5',
      padding: 8,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 8,
    },
    followButton: {
      backgroundColor: theme.colors.primary,
      padding: 10,
      marginVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    followingButton: {
      backgroundColor: 'white',
      color: theme.colors.secondary,
      padding: 10,
      marginVertical: 8,
      borderRadius: 8,
      gap: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.secondary,
    },
    followingText: {
      color: theme.colors.secondary,
    },
    followText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    editProfileText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.base,
    },
  });

  return styles;
};
