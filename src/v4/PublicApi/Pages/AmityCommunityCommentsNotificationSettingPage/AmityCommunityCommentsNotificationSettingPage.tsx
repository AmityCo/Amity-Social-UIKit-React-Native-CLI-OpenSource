import React from 'react';
import CommentsNotificationSetting from '~/v4/features/community/CommentsNotificationSetting';

type AmityCommunityCommentsNotificationSettingPageProps = {
  community: Amity.Community;
};

const AmityCommunityCommentsNotificationSettingPage = ({
  community,
}: AmityCommunityCommentsNotificationSettingPageProps) => {
  return <CommentsNotificationSetting community={community} />;
};

export default AmityCommunityCommentsNotificationSettingPage;
