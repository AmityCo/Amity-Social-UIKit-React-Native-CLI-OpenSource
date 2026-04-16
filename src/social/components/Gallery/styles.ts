import { Dimensions, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

const GAP = 8;
const NUM_COLUMNS = 2;

const dimension = Dimensions.get('window');

const CELL_SIZE =
  (dimension.width - 16 * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    columnWrapper: {
      gap: GAP,
      flexDirection: 'row',
    },
    rowSeparator: {
      height: GAP,
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      position: 'relative',
    },
    cellImage: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
      objectFit: 'cover',
    },
    timestampContainer: {
      left: 8,
      bottom: 8,
      borderRadius: 4,
      paddingVertical: 1,
      paddingHorizontal: 4,
      position: 'absolute',
      backgroundColor: theme.colors.transparentBlack,
    },
    timestamp: {
      color: theme.colors.background,
    },
  });

  return { styles };
};
