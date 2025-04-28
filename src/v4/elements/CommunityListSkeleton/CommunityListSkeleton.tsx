import React, { FC, memo } from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { getSkeletonBackgrounColor } from '../../../util/colorUtil';

type CommunityListSkeletonProps = {
  themeStyle?: MyMD3Theme;
  amount?: number;
};

const CommunityListSkeleton: FC<CommunityListSkeletonProps> = ({
  themeStyle,
  amount = 4,
}) => {
  const { backgroundColor, foregroundColor } =
    getSkeletonBackgrounColor(themeStyle);

  const titleHeight = 36;
  const gap = 16;
  const marginTop = 23;
  const height = 80;
  const width = 80;
  return (
    <ContentLoader
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <Rect x="0" y="0" width="156" height="12" rx="6" ry="6" />
      {Array.from({ length: amount }, (_, index) => {
        return (
          <React.Fragment key={index}>
            <Rect
              key={index}
              x="0"
              y={index * (height + gap) + titleHeight}
              width={width}
              height={height}
              rx="8"
              ry="8"
            />
            <Rect
              x="100"
              y={index * (height + gap) + titleHeight + marginTop}
              width="196"
              height="12"
              rx="6"
              ry="6"
            />
            <Rect
              x="100"
              y={index * (height + gap) + 24 + titleHeight + marginTop}
              width="90"
              height="10"
              rx="6"
              ry="6"
            />
          </React.Fragment>
        );
      })}
    </ContentLoader>
  );
};

export default memo(CommunityListSkeleton);
