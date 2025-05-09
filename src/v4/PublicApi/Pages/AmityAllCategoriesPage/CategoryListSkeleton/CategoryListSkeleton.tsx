import { SafeAreaView } from 'react-native';
import React, { FC, memo } from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { MyMD3Theme } from '../../../../../providers/amity-ui-kit-provider';
import { getSkeletonBackgrounColor } from '../../../../../util/colorUtil';

type CategoryListSkeletonProps = {
  themeStyle?: MyMD3Theme;
  amount?: number;
};

const CategoryListSkeleton: FC<CategoryListSkeletonProps> = ({
  themeStyle,
  amount = 4,
}) => {
  const { backgroundColor, foregroundColor } =
    getSkeletonBackgrounColor(themeStyle);

  const itemHeight = 60; // Height for each item (circle + rect)
  const circleSize = 40; // Circle diameter

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ContentLoader
        height={400}
        width={400}
        speed={1}
        viewBox="0 0 400 400"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        {Array.from({ length: amount }, (_, index) => {
          const yPosition = index * itemHeight;
          return (
            <>
              <Circle
                cx={15}
                cy={yPosition + circleSize / 2}
                r={circleSize / 2}
              />
              <Rect
                x={60}
                y={yPosition + (circleSize - 10) / 2} // Center vertically with circle
                rx="4"
                ry="4"
                width="140"
                height="10"
              />
            </>
          );
        })}
      </ContentLoader>
    </SafeAreaView>
  );
};

export default memo(CategoryListSkeleton);
