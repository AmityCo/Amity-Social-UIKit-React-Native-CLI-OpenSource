// Upload atom — ported from AmityUiKitWeb core/design/atoms/Loader/Upload.
// A determinate/indeterminate progress ring with an optional cancel button or
// countdown overlay. Web draws an animated SVG ring; RN reproduces it with
// react-native-svg circles plus an Animated rotation loop (matching the web
// upload-spin so an indeterminate arc reads as loading, not stuck).

import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AmityIcon } from '../../../icons';
import {
  RING_CIRCUMFERENCE,
  RING_RADIUS,
  RING_STROKE_WIDTH,
  TRACK_OPACITY,
  useStyles,
} from './styles';

export type UploadSize = 'medium' | 'large';

export type UploadProps = {
  size?: UploadSize;
  progress?: number;
  onCancel?: () => void;
  accessibilityLabel?: string;
};

const INDETERMINATE_ARC = 25;

export function Upload({
  size = 'medium',
  progress,
  onCancel,
  accessibilityLabel = 'Loading',
}: UploadProps) {
  const {
    styles,
    dimension,
    trackColor,
    arcColor,
    cancelIconSize,
    cancelIconColor,
  } = useStyles(size);

  const isIndeterminate = progress === undefined;
  const value = isIndeterminate
    ? INDETERMINATE_ARC
    : Math.max(0, Math.min(100, progress));
  const showCountdown = size === 'large' && !onCancel && !isIndeterminate;

  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const dashArray = `${
    (value / 100) * RING_CIRCUMFERENCE
  },${RING_CIRCUMFERENCE}`;

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]}>
        <Svg width={dimension} height={dimension} viewBox="0 0 40 40">
          <Circle
            cx={20}
            cy={20}
            r={RING_RADIUS}
            fill="none"
            stroke={trackColor}
            strokeWidth={RING_STROKE_WIDTH}
            opacity={TRACK_OPACITY}
          />
          <Circle
            cx={20}
            cy={20}
            r={RING_RADIUS}
            fill="none"
            stroke={arcColor}
            strokeWidth={RING_STROKE_WIDTH}
            strokeLinecap="butt"
            strokeDasharray={dashArray}
          />
        </Svg>
      </Animated.View>
      {onCancel ? (
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <AmityIcon
            name="cross-l"
            size={cancelIconSize}
            tokenColor={cancelIconColor}
          />
        </Pressable>
      ) : showCountdown ? (
        <Text style={styles.countdown}>{Math.round(value)}</Text>
      ) : null}
    </View>
  );
}
