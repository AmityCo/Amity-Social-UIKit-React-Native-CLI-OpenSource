import { StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';
export const useStyles = () => {
  const { width, height } = useWindowDimensions();
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingVertical: 16,
      borderBottomColor: theme.colors.baseShade4,
      borderBottomWidth: 1,
    },
    modal: {
      flex: 1,
      height,
      width,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      margin: 1,
      color: theme.colors.base,
    },
    scrollView: {
      justifyContent: 'space-between',
    },
    itemContainer: {
      alignItems: 'center',
      marginLeft: 8,
      width: 68,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 56,
      margin: 4,
    },
    itemText: {
      fontSize: 13,
      fontWeight: '400',
      color: theme.colors.base,
    },
    textRow: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    arrowIcon: {
      marginRight: 16,
      display: 'flex',
    },
    seeAllBtn: {
      marginRight: 16,
    },
    seeAllIcon: {
      width: 40,
      height: 40,
      borderRadius: 25,
      backgroundColor: '#ededed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    seeAllText: {
      fontSize: 13,
      marginTop: 6,
    },
    storyRing: {
      position: 'absolute',
    },
    officialIcon: {
      position: 'absolute',
      left: 45,
      top: 42,
    },
    communityAvatar: {
      width: 40,
      height: 40,
      borderRadius: 56,
      margin: 4,
    },
    avatarContainer: {
      alignItems: 'center',
      width: 68,
    },
    storyCreateIcon: {
      position: 'absolute',
      left: 42,
      top: 30,
    },
  });

  return styles;
};
