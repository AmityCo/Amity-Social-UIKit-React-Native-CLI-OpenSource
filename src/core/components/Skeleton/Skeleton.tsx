import { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle, ViewProps, View } from 'react-native';
import { useStyles } from './styles';

type DimensionValue = number | `${number}%`;

type SkeletonProps = ViewProps & { style?: StyleProp<ViewStyle> };

type SkeletonItemProps = ViewProps & {
  width: DimensionValue;
  height: DimensionValue;
  bottom?: number;
  shimmer?: boolean;
  style?: StyleProp<ViewStyle>;
};

type SquareProps = SkeletonItemProps & {
  radius?: number;
};

function useSkeletonColor(shimmer = true) {
  const { styles, colors } = useStyles();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!shimmer) return () => {};
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, shimmer]);

  return { opacity, styles, backgroundColor: colors.baseShade4 };
}

function Skeleton({ children, style, ...props }: SkeletonProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

function Square({
  width,
  height,
  bottom,
  radius = 4,
  shimmer = true,
  style,
  ...props
}: SquareProps) {
  const { opacity, styles } = useSkeletonColor(shimmer);

  return (
    <Animated.View
      style={[
        styles.square,
        { width, height, borderRadius: radius, opacity, marginBottom: bottom },
        style,
      ]}
      {...props}
    />
  );
}

function Circle({
  width,
  height,
  style,
  bottom,
  shimmer = true,
  ...props
}: SkeletonItemProps) {
  const { opacity, styles } = useSkeletonColor(shimmer);
  const size = 9999;

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width,
          height,
          borderRadius: size / 2,
          opacity,
          marginBottom: bottom,
        },
        style,
      ]}
      {...props}
    />
  );
}

function Line({
  width,
  height,
  style,
  bottom,
  shimmer = true,
  ...props
}: SkeletonItemProps) {
  const { opacity, styles } = useSkeletonColor(shimmer);

  return (
    <Animated.View
      style={[
        styles.line,
        { width, height, opacity, marginBottom: bottom },
        style,
      ]}
      {...props}
    />
  );
}

Skeleton.Square = Square;

Skeleton.Circle = Circle;

Skeleton.Line = Line;

export default Skeleton;
