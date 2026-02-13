import React from 'react';
import LivestreamsNotificationSetting from '../../../../social/features/community/LivestreamsNotificationSetting';

type AmityCommunityLivestreamsNotificationSettingPageProps = {
  community: Amity.Community;
};

const AmityCommunityLivestreamsNotificationSettingPage = ({
  community,
}: AmityCommunityLivestreamsNotificationSettingPageProps) => {
  return <LivestreamsNotificationSetting community={community} />;
};

export default AmityCommunityLivestreamsNotificationSettingPage;
