import {
  CommunityPostSettings,
  CommunityRepository,
} from '@amityco/ts-sdk-react-native';
import { useEffect, useState } from 'react';
import { isModerator } from '../utils/permissions';
import useAuth from '../../core/hooks/useAuth';

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

    CommunityRepository.Membership.searchMembers(
      {
        communityId: community.communityId,
        search: client.userId,
        limit: 1,
        memberships: ['member'],
        includeDeleted: false,
      },
      ({ data }) => {
        const userRoles = data[0]?.roles ?? [];
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
