// Styles for VideoScrubber — ported from AmityUiKitWeb VideoProgressBar.module.css.
// Geometry: container bottom 2.5rem→40, left/right 0.75rem→12; time row margin-bottom
// 1rem→16; track container 1.25rem→20 tall with 0.5rem→8 vertical padding; track
// 0.25rem→4 tall, radius 0.125rem→2; drag dot 0.75rem→12. Track bg is 30% white and
// the dot is transparent-on-video, so both stay as rgba() (scrim colours are allowed);
// the solid-white fill/dot use the white text token.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();
  const white = token(AmityColorToken.TextBaseInverse);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 40,
      left: 12,
      right: 12,
    },
    timeDisplay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    timeText: {
      color: white,
      fontSize: 12,
    },
    trackContainer: {
      height: 20,
      paddingVertical: 8,
      justifyContent: 'center',
    },
    trackBackground: {
      width: '100%',
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      overflow: 'hidden',
    },
    trackFill: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: white,
    },
    dragDot: {
      position: 'absolute',
      top: '50%',
      marginTop: -6,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: white,
    },
  });

  return { styles };
};
