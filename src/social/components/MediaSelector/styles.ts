import { StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

const NUM_COLUMNS = 3;
const CELL_GAP = 2;

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const { width } = useWindowDimensions();
  const cellSize = Math.floor(
    (width - CELL_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      height: 56,
    },
    headerButton: {
      minWidth: 64,
    },
    headerButton__right: {
      minWidth: 64,
      alignItems: 'flex-end',
    },
    headerTitle: {
      color: theme.colors.base,
      fontSize: 16,
      fontWeight: '600',
    },
    headerClose: {
      color: theme.colors.base,
      fontSize: 16,
    },
    headerAdd: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    headerAdd__disabled: {
      color: theme.colors.baseShade3,
      fontSize: 16,
      fontWeight: '600',
    },
    grid: {
      paddingBottom: 24,
    },
    cell: {
      width: cellSize,
      height: cellSize,
      marginRight: CELL_GAP,
      marginBottom: CELL_GAP,
      backgroundColor: theme.colors.baseShade4,
    },
    cell__image: {
      width: '100%',
      height: '100%',
    },
    cell__selectedOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    cell__badge: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    cell__badgeEmpty: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    cell__badgeLabel: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    cell__videoDuration: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
      textShadowColor: 'rgba(0,0,0,0.6)',
      textShadowRadius: 2,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    empty__text: {
      color: theme.colors.baseShade1,
      fontSize: 14,
      textAlign: 'center',
    },
  });

  return { styles, theme };
};
