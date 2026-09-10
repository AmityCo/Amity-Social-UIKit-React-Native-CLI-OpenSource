// Skeleton — ported from AmityUiKitWeb core/design/components/Skeleton.
// A placeholder box filled with the skeleton-effect surface token. The web
// shimmer (CSS `pulse` keyframes: opacity 1 -> 0.4 -> 1 over 1.75s,
// cubic-bezier(0.4, 0, 0.6, 1), infinite) is ported to an RN Animated opacity
// loop. Default square radius is 8px (web 0.5rem); pass `circle` for a round
// placeholder (avatars) or an explicit `borderRadius` for pills.

import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useStyles } from './styles';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PULSE_DURATION = 1750;

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  circle = false,
  style,
}: SkeletonProps) {
  const { styles } = useStyles();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: PULSE_DURATION / 2,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: PULSE_DURATION / 2,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const radius =
    circle && typeof height === 'number' ? height / 2 : borderRadius;

  return (
    <Animated.View
      accessibilityRole="none"
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}
