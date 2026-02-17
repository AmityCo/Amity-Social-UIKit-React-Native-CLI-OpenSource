import React from 'react';
import StorySetting from '../../../features/community/StorySetting';

type AmityCommunityStorySettingPageProps = {
  community: Amity.Community;
};

const AmityCommunityStorySettingPage = ({
  community,
}: AmityCommunityStorySettingPageProps) => {
  return <StorySetting community={community} />;
};

export default AmityCommunityStorySettingPage;
