import React from 'react';
import { useStyles } from './styles';
import { View } from 'react-native';
import ContentLoader, { Circle, Rect } from 'react-content-loader/native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { getSkeletonBackgrounColor } from '../../../util/colorUtil';

type CommunityFeedSkeletonProps = {
  themeStyles: MyMD3Theme;
};

function CommunityFeedSkeleton({ themeStyles }: CommunityFeedSkeletonProps) {
  const { backgroundColor, foregroundColor } =
    getSkeletonBackgrounColor(themeStyles);
  const styles = useStyles(themeStyles);

  return Array.from({ length: 3 }, (_, index) => (
    <View style={[styles.container, index < 2 && styles.divider]} key={index}>
      <ContentLoader
        speed={1}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        <Circle cx="16" cy="16" r="16" />
        <Rect x="40" y="4" width="180" height="8" rx="3" />
        <Rect x="40" y="20" width="64" height="8" rx="3" />
        <Rect x="0" y="56" width="240" height="8" rx="3" />
        <Rect x="0" y="76" width="180" height="8" rx="3" />
        <Rect x="0" y="96" width="300" height="8" rx="3" />
      </ContentLoader>
    </View>
  ));
}

export default CommunityFeedSkeleton;
