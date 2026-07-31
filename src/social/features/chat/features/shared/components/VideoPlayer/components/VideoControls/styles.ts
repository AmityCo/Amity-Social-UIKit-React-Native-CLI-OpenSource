// Styles for VideoControls — ported from AmityUiKitWeb VideoPlayer.module.css +
// VideoHeader.module.css (mobile layout). Geometry: header padding 1rem/0.75rem→16/12
// with a top→bottom black scrim; header icon button 1.5rem→24, transparent bg; center
// row gap 2rem→32; each control button 2.5rem→40 circle, 0.5rem→8 padding, 50% black
// fill, 1.5rem→24 white icon. Button fills / scrims are rgba() (allowed).

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingVertical: 16,
      paddingHorizontal: 12,
    },
    headerButton: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    centerWrap: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 32,
    },
    circleButton: {
      width: 40,
      height: 40,
      padding: 8,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  });

  return { styles };
};
