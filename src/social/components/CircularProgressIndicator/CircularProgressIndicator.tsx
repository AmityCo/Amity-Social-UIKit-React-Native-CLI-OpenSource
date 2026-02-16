import { useStyles } from './styles';
import { Circle, Svg } from 'react-native-svg';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

type CircularProgressIndicatorProps = {
  progress?: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  backgroundOpacity?: number;
  duration?: number;
};

export const CircularProgressIndicator: React.FC<
  CircularProgressIndicatorProps
> = ({
  progress,
  size = 50,
  strokeWidth = 4,
  backgroundColor = 'rgba(255, 255, 255, 0.5)',
  progressColor = 'white',
  backgroundOpacity = 1,
  duration = 1000,
}) => {
  const styles = useStyles();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const isProgressMode = progress !== undefined;
  const strokeDashoffset = isProgressMode
    ? circumference - (progress / 100) * circumference
    : 0;

  useEffect(() => {
    if (!isProgressMode) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [rotateAnim, duration, isProgressMode]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderProgressVersion = () => (
    <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="transparent"
        opacity={backgroundOpacity}
      />

      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );

  const renderRotatingVersion = () => (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { transform: [{ rotate }] }]}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={backgroundOpacity}
          strokeDasharray={`${circumference} ${circumference}`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {isProgressMode ? renderProgressVersion() : renderRotatingVersion()}
    </View>
  );
};
