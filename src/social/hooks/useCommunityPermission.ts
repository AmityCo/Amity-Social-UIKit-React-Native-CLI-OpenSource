import { Client } from '@amityco/ts-sdk-react-native';
import { MemberRoles } from '../../core/constants';
import { useCommunityMemberCollection } from './collections/community/useCommunityMemberCollection';
import { useUser } from './useUser';
import { isAdmin } from '../utils/permissions';

/**
 * Who may review a community's pending posts, resolved the way web resolves it
 * (useCommunityPermission + useCommunityModeratorsCollection).
 *
 * Moderating a community is a property of the membership, not of the user: a
 * moderator of one community carries no moderator role on their own user
 * object. Reading the user's roles therefore misses every moderator who is not
 * also a network-wide one.
 */
export const useCommunityPermission = (
  communityId?: Amity.Community['communityId']
) => {
  const myId = Client.getActiveClient()?.userId;
  const currentUser = useUser(myId ?? '');

  const { members: moderators } = useCommunityMemberCollection({
    enabled: !!communityId,
    params: {
      communityId: communityId as string,
      roles: [MemberRoles.COMMUNITY_MODERATOR],
      limit: 20,
    },
  });

  const isCommunityModerator = !!moderators?.some(
    (moderator) => moderator.userId === myId
  );
  const isGlobalAdmin = isAdmin(currentUser?.roles);

  return {
    isCommunityModerator,
    canReviewCommunityPosts: isGlobalAdmin || isCommunityModerator,
  };
};
