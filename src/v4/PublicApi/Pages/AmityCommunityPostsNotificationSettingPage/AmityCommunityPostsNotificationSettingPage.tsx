import React from 'react';
import PostsNotificationSetting from '~/v4/features/community/PostsNotificationSetting';

type AmityCommunityPostsNotificationSettingPageProps = {
  community: Amity.Community;
};

const AmityCommunityPostsNotificationSettingPage = ({
  community,
}: AmityCommunityPostsNotificationSettingPageProps) => {
  return <PostsNotificationSetting community={community} />;
};

export default AmityCommunityPostsNotificationSettingPage;
