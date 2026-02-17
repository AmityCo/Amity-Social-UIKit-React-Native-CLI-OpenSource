import React from 'react';
import CommunityPostPermission from '../../../features/community/PostPermission';

type AmityCommunityPostPermissionPageProps = {
  community: Amity.Community;
};

const AmityCommunityPostPermissionPage = ({
  community,
}: AmityCommunityPostPermissionPageProps) => {
  return <CommunityPostPermission community={community} />;
};

export default AmityCommunityPostPermissionPage;
