import React from 'react';
import { useStyles } from './styles';
import { Dimensions, View } from 'react-native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { getSkeletonBackgrounColor } from '../../../util/colorUtil';

type ImageFeedSkeletonProps = {
  themeStyles: MyMD3Theme;
};

function ImageFeedSkeleton({ themeStyles }: ImageFeedSkeletonProps) {
  const styles = useStyles();
  const { backgroundColor, foregroundColor } =
    getSkeletonBackgrounColor(themeStyles);

  const screenWidth = Dimensions.get('window').width;
  const padding = 32;
  const gap = 8;
  const availableWidth = screenWidth - padding;
  const itemWidth = (availableWidth - gap) / 2;

  return (
    <View style={styles.container}>
      {Array.from({ length: 3 }, (_, index) => (
        <ContentLoader
          speed={1}
          key={index}
          width={availableWidth}
          height={itemWidth}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
        >
          <Rect x="0" y="0" width={itemWidth} height={itemWidth} rx="8" />
          <Rect
            x={itemWidth + gap}
            y="0"
            width={itemWidth}
            height={itemWidth}
            rx="8"
          />
        </ContentLoader>
      ))}
    </View>
  );
}

export default ImageFeedSkeleton;
