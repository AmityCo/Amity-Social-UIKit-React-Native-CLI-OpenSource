import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

// Values map 1:1 from web PR #1830 SelectedMediaComponent.module.css (1rem = 16dp).
// Web composer preview: peek scroll row (slidesPerView=auto, spaceBetween 8,
// slide width = calc(100% - 3.4375rem) = track - 55). NO counter, NO dots.
export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  return StyleSheet.create({
    selectedMedia: {
      width: '100%',
      paddingVertical: 12, // web: padding 0.75rem 0
    },
    selectedMedia__track: {
      position: 'relative',
      width: '100%',
    },
    // Carousel content inset: 16 sides (Design Contract). With slideWidth =
    // trackWidth − 55 this yields the specified 31px next-frame peek at 375.
    selectedMedia__scrollContent: {
      paddingHorizontal: 16,
    },
    selectedMedia__slide: {
      // width + marginRight (spaceBetween 8) set inline from measured track width
    },
    selectedMedia__frame: {
      width: '100%',
      overflow: 'hidden',
      // web: no border-radius; background var(--asc-color-base-shade4)
      backgroundColor: theme.colors.baseShade4,
    },
    selectedMedia__media: {
      width: '100%',
      height: '100%',
    },
    selectedMedia__mediaButton: {
      width: '100%',
      height: '100%',
    },
  });
};
