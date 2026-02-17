import React from 'react';
import PendingRequest from '../../../features/community/PendingRequest';

type AmityCommunityPendingRequestPageProps = {
  community: Amity.Community;
};

const AmityCommunityPendingRequestPage = ({
  community,
}: AmityCommunityPendingRequestPageProps) => {
  return <PendingRequest community={community} />;
};

export default AmityCommunityPendingRequestPage;
