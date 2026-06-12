import {
  CommunityPostSettings,
  CommunityRepository,
} from '@amityco/ts-sdk-react-native';
import { useEffect, useState } from 'react';
import { isModerator } from '../utils/permissions';
import useAuth from '../../core/hooks/useAuth';
import { MemberRoles } from '../../core/constants';

type UsePostPermissionParams = {
  community?: Amity.Community;
};

export function usePostPermission({ community }: UsePostPermissionParams) {
  const { client } = useAuth();
  const [hasPostPermission, setHasPostPermission] = useState(false);

  const isOnlyAdminCanPost =
    community?.postSetting === CommunityPostSettings.ONLY_ADMIN_CAN_POST;

  useEffect(() => {
    if (!community?.communityId || !client?.userId) return;

    CommunityRepository.Membership.getMembers(
      {
        communityId: community.communityId,
        limit: 20,
        roles: [MemberRoles.ADMIN, MemberRoles.COMMUNITY_MODERATOR],
      },
      ({ data }) => {
        const userRoles = data.find(
          (member) => member.userId === client.userId
        )?.roles;
        setHasPostPermission(
          isOnlyAdminCanPost ? isModerator(userRoles) : !!community?.isJoined
        );
      }
    );
  }, [
    community?.communityId,
    client?.userId,
    isOnlyAdminCanPost,
    community?.isJoined,
  ]);

  return hasPostPermission;
}
