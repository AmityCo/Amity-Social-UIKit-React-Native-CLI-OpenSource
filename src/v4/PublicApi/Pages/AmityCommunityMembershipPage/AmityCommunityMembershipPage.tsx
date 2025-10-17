import React from 'react';
import CommunityMembership from '~/v4/features/community/Membership';

type AmityCommunityMembershipPageProps = {
  community: Amity.Community;
};

const AmityCommunityMembershipPage = ({
  community,
}: AmityCommunityMembershipPageProps) => {
  return <CommunityMembership community={community} />;
};

export default AmityCommunityMembershipPage;
