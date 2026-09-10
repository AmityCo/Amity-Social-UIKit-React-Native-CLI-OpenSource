// VideoControls — the custom dark control overlay for the chat full-screen video
// player, ported from AmityUiKitWeb's VideoPlayer MOBILE branch (VideoHeader +
// mobileControlsRow + VideoProgressBar). Web's header had a close on the left and a
// mute on the right; the RN MediaViewer shell already owns a persistent close, so this
// header renders the mute toggle only (see report). The layer fades with `visible`
// and drops pointer events when hidden so the tap layer beneath can re-show it.

// 1. React / RN imports
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

// 2. Third-party imports
import LinearGradient from 'react-native-linear-gradient';

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
  muted: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
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
  muted,
  currentTime,
  duration,
  onTogglePlay,
  onToggleMute,
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
      {/* Top bar: dark gradient scrim + mute toggle (close lives on the shell). */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']}
        style={styles.header}
        pointerEvents="box-none"
      >
        <Pressable
          style={styles.headerButton}
          hitSlop={8}
          onPress={onToggleMute}
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Unmute' : 'Mute'}
        >
          <AmityIcon
            name={muted ? 'volume-slash-s' : 'volume-high-s'}
            size={24}
            tokenColor={WHITE_ICON}
          />
        </Pressable>
      </LinearGradient>

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
