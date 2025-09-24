import React from 'react';
import Profile from '~/v4/features/user/Profile';

type AmityUserProfilePageProps = {
  userId: string;
};

const AmityUserProfilePage = ({ userId }: AmityUserProfilePageProps) => {
  return <Profile userId={userId} />;
};

export default AmityUserProfilePage;
