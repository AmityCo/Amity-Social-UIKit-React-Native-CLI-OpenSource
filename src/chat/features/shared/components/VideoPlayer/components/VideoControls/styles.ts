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
    // PDT-5309: the mute toggle sits directly on the video, and against light
    // footage a bare white glyph disappeared. Give it the same dark circular
    // chip the viewer's close button already has (MediaViewer.closeButton:
    // 32 round, SurfaceIconButtonTransparentPrimaryEnabled = 50% black), so the
    // two header buttons finally match each other and the Figma.
    headerButton: {
      width: 32,
      height: 32,
      padding: 4,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
