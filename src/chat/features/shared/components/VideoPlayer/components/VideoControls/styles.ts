// Styles for VideoControls — ported from AmityUiKitWeb VideoPlayer.module.css +
// VideoHeader.module.css (mobile layout). Geometry: header padding 1rem/0.75rem→16/12
// with a top→bottom black scrim; header icon button 2rem→32 on a 50%-black circle
// (PDT-5309 — it used to be a bare 24 transparent glyph); center
// row gap 2rem→32; each control button 2.5rem→40 circle, 0.5rem→8 padding, 50% black
// fill, 1.5rem→24 white icon. Button fills / scrims are rgba() (allowed).

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
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
