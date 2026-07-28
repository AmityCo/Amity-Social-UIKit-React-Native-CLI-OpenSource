// Styles for VideoPlayer — the video fills the MediaViewer stage, with the custom
// control overlay (VideoControls) stacked on top. Web used max-width/max-height 100%
// with object-fit: contain; RN maps that to a full-bleed container plus
// resizeMode="contain" on the Video element. No theme colours here.

import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const styles = StyleSheet.create({
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
