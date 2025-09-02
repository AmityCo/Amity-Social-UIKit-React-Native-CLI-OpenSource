import { rgba } from 'polished';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    memberChip: {
      gap: 4,
      alignItems: 'center',
      width: 64,
    },
    memberAvatarContainer: {
      position: 'relative',
    },
    memberAvatar: {
      width: 40,
      height: 40,
      borderRadius: 100,
      objectFit: 'cover',
    },
    memberName: {
      color: theme.colors.base,
    },
    removeButtonContainer: {
      right: -2,
      padding: 2,
      borderRadius: 100,
      position: 'absolute',
      backgroundColor: rgba(theme.colors.base, 0.4),
    },
  });
  return {
    styles,
    theme,
  };
};
