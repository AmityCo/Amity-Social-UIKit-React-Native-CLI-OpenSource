import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { isModerator } from '../../core/utils/permission';
import { useEffect, useState } from 'react';
import { MemberRoles } from '../../core/constants';

export const useIsCommunityModerator = ({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) => {
  const [isCommunityModerator, setisCommunityModerator] = useState(false);
  useEffect(() => {
    if (!userId || !communityId) return setisCommunityModerator(false);
    const unsub = CommunityRepository.Membership.getMembers(
      {
        communityId,
        limit: 20,
        roles: [MemberRoles.ADMIN, MemberRoles.COMMUNITY_MODERATOR],
      },
      ({ error, loading, data }) => {
        if (error) return setisCommunityModerator(false);
        if (!loading) {
          const userRoles = data.find((m) => m.userId === userId)?.roles;
          setisCommunityModerator(isModerator(userRoles));
        }
      }
    );
    return () => unsub();
  }, [communityId, userId]);
  return { isCommunityModerator };
};
