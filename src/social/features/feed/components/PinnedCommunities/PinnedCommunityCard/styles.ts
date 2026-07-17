import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    // No outer border / no wrapping box: the mockup shows the image as a
    // standalone rounded banner with the text sitting below it (unbordered).
    container: {
      width: '100%',
      flexDirection: 'column',
    },
    // Taller banner than the carousel card so the pinned community reads as a
    // hero/featured card. Rounded on all four corners (its own rounded rect),
    // with a larger radius than the carousel card.
    image: {
      width: '100%',
      height: 180,
      borderRadius: 12,
    },
    imagePlaceholder: {
      width: '100%',
      height: 180,
      borderRadius: 12,
      backgroundColor: theme.colors.secondaryShade3,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Text block below the image; no side padding so name/members align to the
    // card's left edge (matching the mockup), just a small top gap from the
    // image kept tight to match the compact mockup spacing.
    detailWrap: {
      paddingTop: 8,
    },
    displayName: {
      flexDirection: 'row',
      gap: 2,
      alignItems: 'center',
      marginBottom: 4,
    },
    categoriesRow: {
      marginBottom: 4,
    },
  });
  return styles;
};
