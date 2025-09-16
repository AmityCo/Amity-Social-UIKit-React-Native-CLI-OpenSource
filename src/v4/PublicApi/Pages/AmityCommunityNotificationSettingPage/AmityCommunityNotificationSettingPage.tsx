import React from 'react';
import NotificationSetting from '~/v4/features/community/NotificationSetting';

type AmityCommunityStorySettingPageProps = {
  community: Amity.Community;
};

const AmityCommunityStorySettingPage = ({
  community,
}: AmityCommunityStorySettingPageProps) => {
  return <NotificationSetting community={community} />;
};

export default AmityCommunityStorySettingPage;
