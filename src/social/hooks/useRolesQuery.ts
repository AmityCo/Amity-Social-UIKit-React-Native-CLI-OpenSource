import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';

type Payload = {
  communityId: string;
  roles: string[];
  userIds: string[];
};

export function useRolesQuery() {
  const { mutate: addRoles } = useMutation<boolean, Error, Payload>({
    mutationFn: ({ communityId, roles, userIds }) =>
      CommunityRepository.Moderation.addRoles(communityId, roles, userIds),
  });

  const { mutate: removeRoles } = useMutation<boolean, Error, Payload>({
    mutationFn: ({ communityId, roles, userIds }) =>
      CommunityRepository.Moderation.removeRoles(communityId, roles, userIds),
  });

  return {
    addRoles,
    removeRoles,
  };
}
