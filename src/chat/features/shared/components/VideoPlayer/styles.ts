// Styles for VideoPlayer — the video fills the MediaViewer stage, with the custom
// control overlay (VideoControls) stacked on top. Web used max-width/max-height 100%
// with object-fit: contain; RN maps that to a full-bleed container plus
// resizeMode="contain" on the Video element. No theme colours here.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
    // PDT-5309: the mute glyph was a bare white icon on the footage and vanished
    // against light content. Same 32px 50%-black chip the viewer's close button
    // carries, so the two ends of web's single VideoHeader row match.
    muteButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    stage: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    video: {
      width: '100%',
      height: '100%',
    },
  });

  return { styles };
};
