import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';

// Values map 1:1 from web PR #1830 PostMediaElement.module.css (1rem = 16dp).
// Colors resolve through theme tokens (web CSS variables), never hardcoded.
export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    postMedia: {
      // Full-bleed: cancel the post card's 16px horizontal padding so the media
      // spans the full card width (web PR #1830/#1834: width calc(100% + 2rem),
      // margin-left/right -1rem).
      marginHorizontal: -16,
      paddingVertical: 8, // web: padding 0.5rem 0
    },
    postMedia__track: {
      position: 'relative',
      width: '100%',
    },
    postMedia__slide: {
      // width is set dynamically to the measured track width so paging aligns
    },
    postMedia__frame: {
      width: '100%',
      overflow: 'hidden',
      // web: no border-radius; background var(--asc-color-base-shade4)
      backgroundColor: theme.colors.baseShade4,
    },
    postMedia__media: {
      width: '100%',
      height: '100%',
    },
    postMedia__playButton: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      // web: 2.5rem (40dp), centred via translate(-50%, -50%)
      width: 40,
      height: 40,
      transform: [{ translateX: -20 }, { translateY: -20 }],
      zIndex: 1,
    },
    postMedia__broken: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.baseShade4,
    },
    postMedia__counter: {
      position: 'absolute',
      top: 8, // web: 0.5rem
      right: 8, // web: 0.5rem
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6, // web: 0.375rem
      paddingHorizontal: 12, // web: 0.75rem
      borderRadius: 999, // web: --asc-border-radius-full
      backgroundColor: 'rgba(0,0,0,0.5)', // web: --asc-color-transparent-black (#00000080)
    },
    postMedia__counterLabel: {
      color: '#FFFFFF', // web: var(--asc-color-white)
    },
    postMedia__indicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4, // web: gap 0.25rem
      height: 6, // web: height 0.375rem
      marginTop: 12, // web: parent .postMedia column gap 0.75rem
    },
    postMedia__dotSlot: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 6, // web: 0.375rem
      height: 6, // web: 0.375rem
    },
    postMedia__dot: {
      borderRadius: 999, // web: border-radius 50%
      backgroundColor: theme.colors.baseShade4, // inactive/edge: base-shade4
    },
    postMedia__dotActive: {
      width: 6,
      height: 6,
      backgroundColor: theme.colors.base, // web: var(--asc-color-base-default)
    },
    postMedia__dotInactive: {
      width: 6,
      height: 6,
    },
    postMedia__dotEdge: {
      width: 3, // web: 0.1875rem
      height: 3,
    },
  });

  return styles;
};
