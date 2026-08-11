import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  GestureResponderEvent,
  Image,
  ImageStyle,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Video, {
  type OnLoadData,
  type OnProgressData,
  type VideoRef,
} from 'react-native-video';
import { SvgXml } from 'react-native-svg';
import {
  clearIcon,
  pauseControlIcon,
  playControlIcon,
  soundOnIcon,
  soundOffIcon,
} from '../../../core/assets/icons/xml';
import { useStyles } from './styles';

export type MediaViewerItem = {
  type: 'image' | 'video';
  uri: string;
  /** e.g. 'm3u8' for HLS (published) videos; omit for local files. */
  videoType?: string;
};

type MediaViewerProps = {
  visible: boolean;
  items: MediaViewerItem[];
  initialIndex: number;
  /** Called with the last-viewed index so the caller can decide where to
   * return (published: last-viewed; composer: originally-tapped). */
  onClose: (lastIndex: number) => void;
};

const CONTROLS_AUTO_HIDE_MS = 3000;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MediaViewer({
  visible,
  items,
  initialIndex,
  onClose,
}: MediaViewerProps) {
  const { styles } = useStyles();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<MediaViewerItem>>(null);
  const videoRef = useRef<VideoRef | null>(null);
  const [current, setCurrent] = useState(initialIndex);
  // Mute-carry (PDT-4309 / PDT-4312): the first video plays unmuted; each swipe
  // defaults the next video to muted — until the user unmutes, after which
  // subsequent videos stay unmuted.
  const [muted, setMuted] = useState(false);
  const keepUnmutedRef = useRef(false);

  // --- playback controls (ported from web VideoPlayerControls) ---
  const [userPaused, setUserPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [trackWidth, setTrackWidth] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimer.current = setTimeout(
      () => setControlsVisible(false),
      CONTROLS_AUTO_HIDE_MS
    );
  }, [clearHideTimer]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const resetPlayback = useCallback(() => {
    setUserPaused(false);
    setProgress(0);
    setDuration(0);
    setScrubbing(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      clearHideTimer();
      return;
    }
    setCurrent(initialIndex);
    setMuted(false);
    keepUnmutedRef.current = false;
    resetPlayback();
    revealControls();
  }, [visible, initialIndex, resetPlayback, revealControls, clearHideTimer]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!width) return;
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      if (idx !== current) {
        setCurrent(idx);
        setMuted(!keepUnmutedRef.current);
        resetPlayback();
        revealControls();
      }
    },
    [width, current, resetPlayback, revealControls]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      keepUnmutedRef.current = !next; // user unmuted -> keep unmuted afterwards
      return next;
    });
    revealControls();
  }, [revealControls]);

  const togglePlay = useCallback(() => {
    setUserPaused((p) => !p);
    revealControls();
  }, [revealControls]);

  const onLoad = useCallback((data: OnLoadData) => {
    setDuration(data.duration ?? 0);
  }, []);

  const onProgress = useCallback(
    (data: OnProgressData) => {
      if (!scrubbing) setProgress(data.currentTime);
    },
    [scrubbing]
  );

  const seekToX = useCallback(
    (locationX: number) => {
      if (trackWidth <= 0 || duration <= 0) return;
      const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
      setProgress(ratio * duration);
    },
    [trackWidth, duration]
  );

  // Scrubber: a horizontal drag inside a horizontal pager. We claim the gesture
  // and disable FlatList scroll while scrubbing so the two don't fight.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          setScrubbing(true);
          clearHideTimer();
          setControlsVisible(true);
          seekToX(e.nativeEvent.locationX);
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
          seekToX(e.nativeEvent.locationX);
        },
        onPanResponderRelease: (e: GestureResponderEvent) => {
          const ratio =
            trackWidth > 0
              ? Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidth))
              : 0;
          const target = ratio * (duration || 0);
          videoRef.current?.seek(target);
          setProgress(target);
          setScrubbing(false);
          scheduleHide();
        },
        onPanResponderTerminate: () => {
          setScrubbing(false);
          scheduleHide();
        },
      }),
    [seekToX, clearHideTimer, scheduleHide, trackWidth, duration]
  );

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  // The control overlay must live INSIDE the page (a descendant of the pager),
  // so horizontal drags on the tap-target are reclaimed by the FlatList's
  // native scroll — a container-level sibling overlay would swallow swipes.
  const renderControls = useCallback(() => {
    const progressPct =
      duration > 0 ? Math.max(0, Math.min(1, progress / duration)) : 0;
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* full-surface tap target: taps toggle controls; horizontal moves
            fall through to the pager (Pressable cancels on move). */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() =>
            controlsVisible ? setControlsVisible(false) : revealControls()
          }
        />
        {controlsVisible && (
          <>
            {/* Centered play/pause */}
            <View style={styles.centerControls} pointerEvents="box-none">
              <TouchableOpacity style={styles.centerBtn} onPress={togglePlay}>
                <SvgXml
                  xml={
                    userPaused
                      ? playControlIcon('#FFFFFF')
                      : pauseControlIcon('#FFFFFF')
                  }
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom bar: time + scrubbable progress */}
            <View style={styles.controlBar} pointerEvents="box-none">
              <Text style={styles.controlTime}>
                {formatTime(progress)} / {formatTime(duration)}
              </Text>
              <View
                style={styles.progressTrack}
                onLayout={onTrackLayout}
                {...panResponder.panHandlers}
              >
                <View style={styles.progressBg} />
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPct * 100}%` },
                  ]}
                />
              </View>
            </View>
          </>
        )}
      </View>
    );
  }, [
    styles,
    controlsVisible,
    setControlsVisible,
    revealControls,
    togglePlay,
    userPaused,
    progress,
    duration,
    onTrackLayout,
    panResponder,
  ]);

  const renderItem = useCallback(
    ({ item, index }: { item: MediaViewerItem; index: number }) => (
      <View style={[styles.page, { width }]}>
        {item.type === 'video' ? (
          <>
            {/* pointerEvents none so horizontal swipes reach the pager instead
                of being captured by the native video view. */}
            <View style={styles.media} pointerEvents="none">
              <Video
                ref={index === current ? videoRef : undefined}
                source={
                  item.videoType
                    ? { uri: item.uri, type: item.videoType }
                    : { uri: item.uri }
                }
                style={styles.media}
                resizeMode="contain"
                paused={index !== current || !visible || userPaused}
                muted={muted && index === current}
                repeat
                playInBackground={false}
                playWhenInactive={false}
                onLoad={index === current ? onLoad : undefined}
                onProgress={index === current ? onProgress : undefined}
              />
            </View>
            {index === current && renderControls()}
          </>
        ) : (
          <Image
            source={{ uri: item.uri }}
            style={styles.media as StyleProp<ImageStyle>}
            resizeMode="contain"
          />
        )}
      </View>
    ),
    [
      styles,
      width,
      current,
      muted,
      visible,
      userPaused,
      onLoad,
      onProgress,
      renderControls,
    ]
  );

  const currentIsVideo = items[current]?.type === 'video';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(current)}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => onClose(current)}
          >
            <SvgXml xml={clearIcon('white')} width={28} height={28} />
          </TouchableOpacity>
          <Text style={styles.counter}>
            {current + 1}/{items.length}
          </Text>
          <View style={styles.headerBtn__right}>
            {currentIsVideo && (
              <TouchableOpacity onPress={toggleMute}>
                <SvgXml
                  xml={muted ? soundOffIcon('#FFFFFF') : soundOnIcon('#FFFFFF')}
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlatList
          ref={listRef}
          data={items}
          horizontal
          pagingEnabled
          scrollEnabled={!scrubbing}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(it, i) => `${it.uri}-${i}`}
          renderItem={renderItem}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialScrollIndex={initialIndex}
          onMomentumScrollEnd={onMomentumScrollEnd}
        />
      </View>
    </Modal>
  );
}
