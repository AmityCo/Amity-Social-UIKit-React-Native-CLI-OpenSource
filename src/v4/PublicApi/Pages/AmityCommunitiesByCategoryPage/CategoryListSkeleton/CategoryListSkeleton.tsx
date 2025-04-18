import { View } from 'react-native';
import React, { FC, memo } from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { getSkeletonBackgrounColor } from '~/util/colorUtil';

type CategoryListSkeletonProps = {
  themeStyle?: MyMD3Theme;
};

// TODO: fix style

const CategoryListSkeleton: FC<CategoryListSkeletonProps> = ({
  themeStyle,
}) => {
  const { backgroundColor, foregroundColor } =
    getSkeletonBackgrounColor(themeStyle);

  return (
    <View style={{ padding: 16 }}>
      <ContentLoader
        height={36}
        width={400}
        speed={1}
        viewBox="0 0 400 36"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        <Circle cx="20" cy="20" r="20" />
        {Array.from({ length: 4 }, (_, index) => {
          return (
            <Rect
              key={index}
              x={index !== 0 ? index * (90 + 8) : 0}
              y="0"
              rx="12"
              ry="12"
              width="140"
              height="10"
            />
          );
        })}
      </ContentLoader>
    </View>
  );
};

export default memo(CategoryListSkeleton);
