import { Client } from '@amityco/ts-sdk-react-native';
import { MemberRoles, Permissions } from '~/v4/constants';

export const checkDeleteCommunityPermission = (communityId: string) => {
  const client = Client.getActiveClient();

  const communityPermission = client
    .hasPermission(Permissions.DeleteCommunityPermission)
    .community(communityId);
  return !!communityPermission;
};

export const checkEditCommunityPermission = (communityId?: string) => {
  const client = Client.getActiveClient();

  const communityPermission = client
    .hasPermission(Permissions.EditCommunityPermission)
    .community(communityId);
  return !!communityPermission;
};

export const checkEditRolePermission = (communityId: string) => {
  const client = Client.getActiveClient();

  const communityPermission = client
    .hasPermission(Permissions.EditRolePermission)
    .community(communityId);

  return !!communityPermission;
};

export const isModerator = (roles: string[] = []) => {
  if (!roles?.length) return false;

  const moderatorRoles = [
    MemberRoles.COMMUNITY_MODERATOR,
    MemberRoles.CHANNEL_MODERATOR,
    MemberRoles.MODERATOR,
    MemberRoles.SUPER_MODERATOR,
  ];

  return moderatorRoles.some((role) => roles.includes(role));
};

export const isAdmin = (roles: string[] = []) => {
  if (!roles?.length) return false;

  return roles.includes(MemberRoles.ADMIN);
};
