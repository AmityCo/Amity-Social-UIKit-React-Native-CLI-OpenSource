import React, { FC, memo } from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { MyMD3Theme } from '../../../../../providers/amity-ui-kit-provider';
import { useStyles } from './styles';
import { View } from 'react-native';
import { getSkeletonBackgrounColor } from '../../../../../util/colorUtil';
import { Path } from 'react-native-svg';
import CommunityListSkeleton from '../../../../component/CommunityListSkeleton/CommunityListSkeleton';

type ExploreLoadingSkeletonProps = {
  themeStyles: MyMD3Theme;
};

const ExploreLoadingSkeleton: FC<ExploreLoadingSkeletonProps> = ({
  themeStyles,
}) => {
  const styles = useStyles();
  const { backgroundColor, foregroundColor } =
    getSkeletonBackgrounColor(themeStyles);

  const renderCategoriesSkeleton = () => {
    return (
      <View style={styles.categoriesContainers}>
        <ContentLoader
          height={36}
          width={400}
          speed={1}
          viewBox="0 0 400 36"
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
        >
          {Array.from({ length: 4 }, (_, index) => {
            return (
              <Rect
                key={index}
                x={index !== 0 ? index * (90 + 8) : 0}
                y="0"
                rx="20"
                ry="20"
                width="90"
                height="36"
              />
            );
          })}
        </ContentLoader>
      </View>
    );
  };

  const renderRecommendedCommunitiesSkeleton = () => {
    // Title
    const titleHeight = 44;
    // Card
    const height = 134;
    const width = 268;
    const detailHeight = 88;
    const radius = 8;
    const borderWidth = 1;
    const gap = 12;
    // Card content
    const marginLeft = 12;
    return (
      <View style={styles.categoriesContainers}>
        <ContentLoader
          height={height + detailHeight + titleHeight}
          width={400}
          speed={1}
          viewBox={`0 0 400 ${height + detailHeight + titleHeight}`}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
        >
          <Rect x="0" y="0" width="156" height="12" rx="6" ry="6" />
          {Array.from({ length: 2 }, (_, index) => {
            return (
              <React.Fragment key={index}>
                <Rect
                  x={index * (width + gap)}
                  y={titleHeight}
                  width={width}
                  height={height + detailHeight}
                  rx="8"
                  ry="8"
                />
                <Path
                  d={`
                  M ${index * (width + gap) + borderWidth},${
                    height + titleHeight
                  }
                  L ${(index + 1) * width - borderWidth},${height + titleHeight}
                  L ${(index + 1) * width - borderWidth},${
                    height + detailHeight - radius + titleHeight - borderWidth
                  }
                  Q ${(index + 1) * width - borderWidth},${
                    height + detailHeight + titleHeight - borderWidth
                  } ${(index + 1) * width - radius},${
                    height + detailHeight + titleHeight - borderWidth
                  }
                  L ${index * (width + gap) + radius + borderWidth},${
                    height + detailHeight + titleHeight - borderWidth
                  }
                  Q ${index * (width + gap) + borderWidth},${
                    height + detailHeight + titleHeight - borderWidth
                  } ${index * (width + gap) + borderWidth},${
                    height + detailHeight - radius + titleHeight - borderWidth
                  }
                  L ${index * (width + gap) + borderWidth},${
                    height + titleHeight
                  }
                `}
                />
                <Rect
                  x={index * (width + marginLeft + borderWidth) + gap}
                  y={151 + titleHeight}
                  width="90"
                  height="10"
                  rx="6"
                  ry="6"
                />
                <Rect
                  x={index * (width + marginLeft + borderWidth) + gap}
                  y={177 + titleHeight}
                  width="164"
                  height="8"
                  rx="6"
                  ry="6"
                />
                <Rect
                  x={index * (width + marginLeft + borderWidth) + gap}
                  y={195 + titleHeight}
                  width="196"
                  height="8"
                  rx="6"
                  ry="6"
                />
              </React.Fragment>
            );
          })}
        </ContentLoader>
      </View>
    );
  };

  const renderTrendingCommunitiesSkeleton = () => {
    return (
      <View style={styles.trendingCommunitiesContainer}>
        <CommunityListSkeleton themeStyle={themeStyles} />
      </View>
    );
  };

  return (
    <>
      {renderCategoriesSkeleton()}
      {renderRecommendedCommunitiesSkeleton()}
      {renderTrendingCommunitiesSkeleton()}
    </>
  );
};

export default memo(ExploreLoadingSkeleton);
