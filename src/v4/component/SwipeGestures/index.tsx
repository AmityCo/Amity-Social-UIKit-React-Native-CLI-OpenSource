import React, { useMemo } from 'react';
import {
  View,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';

export const swipeDirections = {
  SWIPE_UP: 'SWIPE_UP',
  SWIPE_DOWN: 'SWIPE_DOWN',
  SWIPE_LEFT: 'SWIPE_LEFT',
  SWIPE_RIGHT: 'SWIPE_RIGHT',
} as const;

type SwipeDirection = (typeof swipeDirections)[keyof typeof swipeDirections];

interface SwipeConfig {
  velocityThreshold: number;
  directionalOffsetThreshold: number;
  gestureIsClickThreshold: number;
}

const defaultSwipeConfig: SwipeConfig = {
  velocityThreshold: 0.3,
  directionalOffsetThreshold: 80,
  gestureIsClickThreshold: 5,
};

interface GestureRecognizerProps {
  config?: Partial<SwipeConfig>;
  onSwipe?: (
    direction: SwipeDirection,
    gestureState: PanResponderGestureState
  ) => void;
  onSwipeUp?: (gestureState: PanResponderGestureState) => void;
  onSwipeDown?: (gestureState: PanResponderGestureState) => void;
  onSwipeLeft?: (gestureState: PanResponderGestureState) => void;
  onSwipeRight?: (gestureState: PanResponderGestureState) => void;
  style?: React.ComponentProps<typeof View>['style'];
  children?: React.ReactNode;
}

const isValidSwipe = (
  velocity: number,
  velocityThreshold: number,
  directionalOffset: number,
  directionalOffsetThreshold: number
): boolean => {
  return (
    Math.abs(velocity) > velocityThreshold &&
    Math.abs(directionalOffset) < directionalOffsetThreshold
  );
};

const GestureRecognizer: React.FC<GestureRecognizerProps> = ({
  config,
  onSwipe,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  style,
  children,
}) => {
  const swipeConfig = useMemo(
    () => ({ ...defaultSwipeConfig, ...config }),
    [config]
  );

  const handleShouldSetPanResponder = (
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ): boolean => {
    return (
      evt.nativeEvent.touches.length === 1 && !isGestureClick(gestureState)
    );
  };

  const isGestureClick = (gestureState: PanResponderGestureState): boolean => {
    return (
      Math.abs(gestureState.dx) < swipeConfig.gestureIsClickThreshold &&
      Math.abs(gestureState.dy) < swipeConfig.gestureIsClickThreshold
    );
  };

  const getSwipeDirection = (
    gestureState: PanResponderGestureState
  ): SwipeDirection | null => {
    const { dx, dy, vx, vy } = gestureState;
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;

    if (
      isValidSwipe(
        vx,
        swipeConfig.velocityThreshold,
        dy,
        swipeConfig.directionalOffsetThreshold
      )
    ) {
      return dx > 0 ? SWIPE_RIGHT : SWIPE_LEFT;
    } else if (
      isValidSwipe(
        vy,
        swipeConfig.velocityThreshold,
        dx,
        swipeConfig.directionalOffsetThreshold
      )
    ) {
      return dy > 0 ? SWIPE_DOWN : SWIPE_UP;
    }
    return null;
  };

  const triggerSwipeHandlers = (
    swipeDirection: SwipeDirection | null,
    gestureState: PanResponderGestureState
  ) => {
    if (!swipeDirection) return;

    onSwipe?.(swipeDirection, gestureState);
    switch (swipeDirection) {
      case swipeDirections.SWIPE_LEFT:
        onSwipeLeft?.(gestureState);
        break;
      case swipeDirections.SWIPE_RIGHT:
        onSwipeRight?.(gestureState);
        break;
      case swipeDirections.SWIPE_UP:
        onSwipeUp?.(gestureState);
        break;
      case swipeDirections.SWIPE_DOWN:
        onSwipeDown?.(gestureState);
        break;
    }
  };

  const handlePanResponderEnd = (
    _evt: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    const swipeDirection = getSwipeDirection(gestureState);
    triggerSwipeHandlers(swipeDirection, gestureState);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: handleShouldSetPanResponder,
    onMoveShouldSetPanResponder: handleShouldSetPanResponder,
    onPanResponderRelease: handlePanResponderEnd,
    onPanResponderTerminate: handlePanResponderEnd,
  });

  return (
    <View style={style} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

export default GestureRecognizer;
