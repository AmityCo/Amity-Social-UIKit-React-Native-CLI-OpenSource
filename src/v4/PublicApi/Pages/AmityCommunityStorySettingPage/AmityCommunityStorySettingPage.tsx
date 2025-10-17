import React from 'react';
import StorySetting from '~/v4/features/community/StorySetting';

type AmityCommunityStorySettingPageProps = {
  community: Amity.Community;
};

const AmityCommunityStorySettingPage = ({
  community,
}: AmityCommunityStorySettingPageProps) => {
  return <StorySetting community={community} />;
};

export default AmityCommunityStorySettingPage;
