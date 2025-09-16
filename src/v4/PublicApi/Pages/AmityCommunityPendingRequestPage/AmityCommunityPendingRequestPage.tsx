import React from 'react';
import PendingRequest from '~/v4/features/community/PendingRequest';

type AmityCommunityPendingRequestPageProps = {
  community: Amity.Community;
};

const AmityCommunityPendingRequestPage = ({
  community,
}: AmityCommunityPendingRequestPageProps) => {
  return <PendingRequest community={community} />;
};

export default AmityCommunityPendingRequestPage;
