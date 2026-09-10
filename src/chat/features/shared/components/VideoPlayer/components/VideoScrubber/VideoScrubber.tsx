// VideoScrubber — ported from AmityUiKitWeb VideoProgressBar (mobile layout).
// A draggable bottom scrubber: a MM:SS / MM:SS time row above a 4px track with a
// solid-white fill and a 12px drag dot. Web set video.currentTime on every touch
// move; per the RN plan we instead track a local fraction while dragging and seek
// only on release (onScrubEnd), pausing during the drag (onScrubStart) and resuming
// upstream. Built with core RN PanResponder because the whole player lives inside a
// native <Modal>, where react-native-gesture-handler gestures do not fire.

// 1. React / RN imports
import { useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';

// 2. Internal imports
import { useStyles } from './styles';

// 3. Types
type VideoScrubberProps = {
  currentTime: number;
  duration: number;
  onScrubStart: () => void;
  onScrubEnd: (seconds: number) => void;
};

// MM:SS, zero-padded — mirrors web VideoProgressBar.formatTime.
function formatTime(seconds: number): string {
  if (Number.isNaN(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

// 4. Named function component
export function VideoScrubber({
  currentTime,
  duration,
  onScrubStart,
  onScrubEnd,
}: VideoScrubberProps) {
  const { styles } = useStyles();
  const [trackWidth, setTrackWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragFraction, setDragFraction] = useState(0);
  const dragFractionRef = useRef(0);
  const trackWidthRef = useRef(0);

  const setDrag = (fraction: number) => {
    dragFractionRef.current = fraction;
    setDragFraction(fraction);
  };

  const fractionFromX = (x: number) => {
    const width = trackWidthRef.current;
    if (width <= 0) return 0;
    return Math.max(0, Math.min(1, x / width));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          setIsDragging(true);
          onScrubStart();
          setDrag(fractionFromX(e.nativeEvent.locationX));
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
          setDrag(fractionFromX(e.nativeEvent.locationX));
        },
        onPanResponderRelease: (e: GestureResponderEvent) => {
          const fraction = fractionFromX(e.nativeEvent.locationX);
          setDrag(fraction);
          setIsDragging(false);
          onScrubEnd(fraction * duration);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
          onScrubEnd(dragFractionRef.current * duration);
        },
      }),
    // fractionFromX reads width via ref, so it need not be a dependency.

    [duration, onScrubStart, onScrubEnd]
  );

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    trackWidthRef.current = width;
    setTrackWidth(width);
  };

  const fraction = isDragging
    ? dragFraction
    : duration > 0
    ? Math.min(1, currentTime / duration)
    : 0;
  const displayCurrent = isDragging ? dragFraction * duration : currentTime;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>{formatTime(displayCurrent)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View
        style={styles.trackContainer}
        onLayout={handleTrackLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBackground}>
          <View style={[styles.trackFill, { width: `${fraction * 100}%` }]} />
        </View>
        {isDragging ? (
          <View
            style={[styles.dragDot, { left: fraction * trackWidth - 6 }]}
            pointerEvents="none"
          />
        ) : null}
      </View>
    </View>
  );
}
