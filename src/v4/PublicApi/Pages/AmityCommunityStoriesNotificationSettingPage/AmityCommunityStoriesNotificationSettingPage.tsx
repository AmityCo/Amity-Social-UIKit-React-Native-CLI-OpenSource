import React from 'react';
import StoriesNotificationSetting from '../../../../social/features/community/StoriesNotificationSetting';

type AmityCommunityStoriesNotificationSettingPageProps = {
  community: Amity.Community;
};

const AmityCommunityStoriesNotificationSettingPage = ({
  community,
}: AmityCommunityStoriesNotificationSettingPageProps) => {
  return <StoriesNotificationSetting community={community} />;
};

export default AmityCommunityStoriesNotificationSettingPage;
