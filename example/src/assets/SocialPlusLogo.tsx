import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

/**
 * Social+ cross logo — recreated from brand assets.
 * Four rounded bars arranged in a + shape with gradient fills.
 */
const SocialPlusLogo: React.FC<LogoProps> = ({ size = 72 }) => {
  const s = size;
  const barW = s * 0.25; // width of each bar
  const barH = s * 0.55; // length of each bar
  const r = barW / 2; // corner radius
  const cx = s / 2;
  const cy = s / 2;
  const overlap = barW * 0.15;

  return (
    <View style={[styles.container, { width: s, height: s }]}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Defs>
          {/* Left bar: blue → dark navy */}
          <LinearGradient id="gradLeft" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6C63FF" />
            <Stop offset="1" stopColor="#3D5CFF" />
          </LinearGradient>
          {/* Top bar: pink → magenta */}
          <LinearGradient id="gradTop" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF6FD8" />
            <Stop offset="1" stopColor="#D946EF" />
          </LinearGradient>
          {/* Right bar: orange → yellow */}
          <LinearGradient id="gradRight" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FBBF24" />
            <Stop offset="1" stopColor="#F97316" />
          </LinearGradient>
          {/* Bottom bar: cyan → blue */}
          <LinearGradient id="gradBottom" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#22D3EE" />
            <Stop offset="1" stopColor="#3D5CFF" />
          </LinearGradient>
          {/* Center overlap: dark navy */}
          <LinearGradient id="gradCenter" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#1E1B4B" />
            <Stop offset="1" stopColor="#312E81" />
          </LinearGradient>
        </Defs>

        <G>
          {/* Left bar (vertical) */}
          <Rect
            x={cx - barH / 2}
            y={cy - barW / 2}
            width={barH}
            height={barW}
            rx={r}
            fill="url(#gradLeft)"
            transform={`rotate(90, ${cx}, ${cy})`}
            opacity={0.95}
          />

          {/* Top bar (horizontal, rotated to vertical going up) */}
          <Rect
            x={cx - barW / 2}
            y={cy - barH / 2}
            width={barW}
            height={barH}
            rx={r}
            fill="url(#gradBottom)"
            opacity={0.95}
          />

          {/* Center overlap square */}
          <Rect
            x={cx - barW / 2 + overlap}
            y={cy - barW / 2 + overlap}
            width={barW - overlap * 2}
            height={barW - overlap * 2}
            rx={overlap}
            fill="url(#gradCenter)"
            opacity={0.7}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SocialPlusLogo;
