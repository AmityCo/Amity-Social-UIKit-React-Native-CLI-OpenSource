// VideoControls — the custom dark control overlay for the chat full-screen video
// player, ported from AmityUiKitWeb's VideoPlayer MOBILE branch
// (mobileControlsRow + VideoProgressBar). The layer fades with `visible` and
// drops pointer events when hidden so the tap layer beneath can re-show it.
//
// Web's VideoHeader is ONE row — close on the left, mute on the right — so the
// mute toggle is handed to MediaViewer's top bar via `headerRight` rather than
// drawn here. It used to live in this overlay, underneath the shell's own bar,
// which covered it: the button could not be tapped at all.

// 1. React / RN imports
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

// 3. Internal imports
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { VideoScrubber } from '../VideoScrubber';
import { useStyles } from './styles';

// 4. Types
type VideoControlsProps = {
  visible: boolean;
  paused: boolean;
  isScrubbing: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onScrubStart: () => void;
  onScrubEnd: (seconds: number) => void;
};

const WHITE_ICON = AmityColorToken.IconIconButtonTransparentPrimaryDefault;

// 5. Named function component
export function VideoControls({
  visible,
  paused,
  isScrubbing,
  currentTime,
  duration,
  onTogglePlay,
  onSkipBackward,
  onSkipForward,
  onScrubStart,
  onScrubEnd,
}: VideoControlsProps) {
  const { styles } = useStyles();
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      {/* Center row: skip back 10 · play/pause · skip forward 10.
          Hidden while scrubbing — mirrors web's `!isDragging` gate. */}
      {!isScrubbing ? (
        <View style={styles.centerWrap} pointerEvents="box-none">
          <View style={styles.centerRow}>
            <Pressable
              style={styles.circleButton}
              onPress={onSkipBackward}
              accessibilityRole="button"
              accessibilityLabel="Skip back 10 seconds"
            >
              <AmityIcon
                name="Video-Backward10-r"
                size={24}
                tokenColor={WHITE_ICON}
              />
            </Pressable>

            <Pressable
              style={styles.circleButton}
              onPress={onTogglePlay}
              accessibilityRole="button"
              accessibilityLabel={paused ? 'Play' : 'Pause'}
            >
              <AmityIcon
                name={paused ? 'video-play-s' : 'video-pause-s'}
                size={24}
                tokenColor={WHITE_ICON}
              />
            </Pressable>

            <Pressable
              style={styles.circleButton}
              onPress={onSkipForward}
              accessibilityRole="button"
              accessibilityLabel="Skip forward 10 seconds"
            >
              <AmityIcon
                name="Video-Forward10-r"
                size={24}
                tokenColor={WHITE_ICON}
              />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Bottom scrubber. */}
      <VideoScrubber
        currentTime={currentTime}
        duration={duration}
        onScrubStart={onScrubStart}
        onScrubEnd={onScrubEnd}
      />
    </Animated.View>
  );
}
