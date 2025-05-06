import React, { memo, FC } from 'react';

export type CommunityTab =
  | 'community_feed'
  | 'community_pin'
  | 'community_image_feed'
  | 'community_video_feed';

type AmityCommunityProfileTabComponentProps = {
  pageId?: string;
  currentTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
};

const AmityCommunityProfileTabComponent: FC<
  AmityCommunityProfileTabComponentProps
> = ({}) => {
  return <></>;
};

export default memo(AmityCommunityProfileTabComponent);
