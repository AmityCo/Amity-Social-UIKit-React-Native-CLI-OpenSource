import React from 'react';
import CommentsNotificationSetting from '../../../../social/features/community/CommentsNotificationSetting';

type AmityCommunityCommentsNotificationSettingPageProps = {
  community: Amity.Community;
};

const AmityCommunityCommentsNotificationSettingPage = ({
  community,
}: AmityCommunityCommentsNotificationSettingPageProps) => {
  return <CommentsNotificationSetting community={community} />;
};

export default AmityCommunityCommentsNotificationSettingPage;
