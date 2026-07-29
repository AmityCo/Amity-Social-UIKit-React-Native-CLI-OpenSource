// VideoPlayer — ported from AmityUiKitWeb chat/features/shared/components/VideoPlayer.
// Resolves the message's video fileId to its raw playable URL, then plays it inside the
// shared MediaViewer shell (close / delete / save chrome). Replaces react-native-video's
// NATIVE controls with a custom dark control overlay ported from the web SOCIAL player's
// MOBILE layout (VideoControls): tap the video to toggle controls, which auto-hide after
// 1s while playing; a header mute toggle, a centre play/pause + ±10s skip row, and a
// draggable bottom scrubber. Playback is driven from react-native-video callbacks + ref.

// 1. React / RN imports
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

// 2. Third-party imports
import Video, { type VideoRef } from 'react-native-video';

// 3. Internal imports
import { MediaViewer } from '../MediaViewer';
import { useVideoFileUrl } from '../../../../hooks/useVideoFileUrl';
import { VideoControls } from './components/VideoControls';
import { useStyles } from './styles';

// Ported from AmityUiKitWeb src/v4/social/constants (VIDEO_CONTROLS_AUTO_HIDE_MS).
const VIDEO_CONTROLS_AUTO_HIDE_MS = 1000;
const SKIP_SECONDS = 10;

// 4. Types
type VideoPlayerProps = {
  message: Amity.Message;
  onClose: () => void;
  isOwn?: boolean;
  onDelete?: () => void;
  /**
   * TEMPORARILY NOT FORWARDED — the save/download button is hidden for video.
   * Still accepted (and still supplied by useMediaViewer) so re-enabling is a
   * one-line change: pass `onSave={onSave}` to MediaViewer below. Images keep
   * their save button; only the video viewer hides it. Web shows it for both.
   */
  onSave?: () => void;
};

// 5. Named function component
export function VideoPlayer({
  message,
  onClose,
  isOwn = false,
  onDelete,
}: VideoPlayerProps) {
  const { styles } = useStyles();
  const fileId = (message.data as { fileId?: string } | undefined)?.fileId;
  const src = useVideoFileUrl(fileId);

  const videoRef = useRef<VideoRef>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPlayingBeforeScrubRef = useRef(false);

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, VIDEO_CONTROLS_AUTO_HIDE_MS);
  }, [clearHideTimer]);

  // Mirror web: while playing, arm the auto-hide; when paused, keep controls shown.
  useEffect(() => {
    if (paused) {
      setControlsVisible(true);
      clearHideTimer();
    } else {
      scheduleHide();
    }
  }, [paused, scheduleHide, clearHideTimer]);

  useEffect(() => clearHideTimer, [clearHideTimer]);

  const handleTapArea = useCallback(() => {
    setControlsVisible((prev) => {
      const next = !prev;
      if (next && !paused) {
        scheduleHide();
      } else {
        clearHideTimer();
      }
      return next;
    });
  }, [paused, scheduleHide, clearHideTimer]);

  const handleTogglePlay = useCallback(() => {
    if (paused && duration > 0 && currentTime >= duration - 0.25) {
      // Replay from the start when resuming after the video ended.
      videoRef.current?.seek(0);
      setCurrentTime(0);
    }
    setPaused((prev) => !prev);
  }, [paused, duration, currentTime]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const seekTo = useCallback(
    (seconds: number) => {
      const clamped = Math.max(
        0,
        duration > 0 ? Math.min(duration, seconds) : seconds
      );
      videoRef.current?.seek(clamped);
      setCurrentTime(clamped);
      if (!paused) scheduleHide();
    },
    [duration, paused, scheduleHide]
  );

  const handleSkipBackward = useCallback(() => {
    seekTo(currentTime - SKIP_SECONDS);
  }, [currentTime, seekTo]);

  const handleSkipForward = useCallback(() => {
    seekTo(currentTime + SKIP_SECONDS);
  }, [currentTime, seekTo]);

  const handleScrubStart = useCallback(() => {
    wasPlayingBeforeScrubRef.current = !paused;
    setIsScrubbing(true);
    clearHideTimer();
    if (!paused) setPaused(true);
  }, [paused, clearHideTimer]);

  const handleScrubEnd = useCallback(
    (seconds: number) => {
      const clamped = Math.max(
        0,
        duration > 0 ? Math.min(duration, seconds) : seconds
      );
      videoRef.current?.seek(clamped);
      setCurrentTime(clamped);
      setIsScrubbing(false);
      if (wasPlayingBeforeScrubRef.current) setPaused(false);
    },
    [duration]
  );

  return (
    <MediaViewer
      accessibilityLabel="Video player"
      onClose={onClose}
      isOwn={isOwn}
      onDelete={onDelete}
      // onSave deliberately omitted — hides the download button (MediaViewer
      // renders a spacer in its place, so delete keeps its position).
    >
      {src ? (
        <View style={styles.stage}>
          <Video
            ref={videoRef}
            source={{ uri: src }}
            paused={paused}
            muted={muted}
            resizeMode="contain"
            playWhenInactive={false}
            playInBackground={false}
            onLoad={(e) => setDuration(e.duration)}
            onProgress={(e) => setCurrentTime(e.currentTime)}
            onEnd={() => {
              setPaused(true);
              setControlsVisible(true);
              clearHideTimer();
            }}
            style={styles.video}
          />

          {/* Full-area tap layer: toggles control visibility. */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleTapArea}
            accessibilityRole="button"
            accessibilityLabel="Toggle video controls"
          />

          <VideoControls
            visible={controlsVisible}
            paused={paused}
            isScrubbing={isScrubbing}
            muted={muted}
            currentTime={currentTime}
            duration={duration}
            onTogglePlay={handleTogglePlay}
            onToggleMute={handleToggleMute}
            onSkipBackward={handleSkipBackward}
            onSkipForward={handleSkipForward}
            onScrubStart={handleScrubStart}
            onScrubEnd={handleScrubEnd}
          />
        </View>
      ) : null}
    </MediaViewer>
  );
}
