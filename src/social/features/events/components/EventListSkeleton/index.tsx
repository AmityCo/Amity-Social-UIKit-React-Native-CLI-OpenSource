import React, { memo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';
import { getSkeletonBackgrounColor } from '../../../../../core/utils/color';

// Web parity: EventListSkeleton — rows of image block (left) + three text
// lines (right), grid 1fr / 1.325fr, row height 120.
const EventListSkeleton = ({ count = 3 }: { count?: number }) => {
  const theme = useTheme<MyMD3Theme>();
  const { width: windowWidth } = useWindowDimensions();
  const { backgroundColor, foregroundColor } = getSkeletonBackgrounColor(theme);

  const rowHeight = 120;
  const gap = 8;
  const width = windowWidth - 32;
  const imageWidth = width * 0.43;
  const textX = imageWidth + 16;
  const height = count * (rowHeight + gap);

  return (
    <View>
      <ContentLoader
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        {Array.from({ length: count }, (_, index) => {
          const y = index * (rowHeight + gap);
          const textY = y + rowHeight / 2 - 28;
          return (
            <React.Fragment key={index}>
              <Rect
                x="0"
                y={y}
                rx="8"
                ry="8"
                width={imageWidth}
                height={rowHeight}
              />
              <Rect x={textX} y={textY} rx="6" ry="6" width="140" height="12" />
              <Rect
                x={textX}
                y={textY + 20}
                rx="6"
                ry="6"
                width="164"
                height="12"
              />
              <Rect
                x={textX}
                y={textY + 40}
                rx="6"
                ry="6"
                width="120"
                height="12"
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </View>
  );
};

export default memo(EventListSkeleton);
