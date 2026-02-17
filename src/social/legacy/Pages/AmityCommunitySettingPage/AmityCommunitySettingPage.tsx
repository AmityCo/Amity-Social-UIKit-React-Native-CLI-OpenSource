import React from 'react';
import CommunitySetting from '../../../features/community/Setting/Setting';

type AmityCommunitySettingPageProps = {
  community: Amity.Community;
};

const AmityCommunitySettingPage = ({
  community,
}: AmityCommunitySettingPageProps) => {
  return <CommunitySetting community={community} />;
};

export default AmityCommunitySettingPage;
