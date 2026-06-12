import { MemberRoles } from '../../core/constants';

const { COMMUNITY_MODERATOR, CHANNEL_MODERATOR, MODERATOR, SUPER_MODERATOR } =
  MemberRoles;

export const isModerator = (userRoles?: string[]) => {
  if (!userRoles?.length) {
    return false;
  }

  const roles: string[] = [
    COMMUNITY_MODERATOR,
    CHANNEL_MODERATOR,
    MODERATOR,
    SUPER_MODERATOR,
  ];

  return userRoles.some((role) => roles.includes(role));
};
