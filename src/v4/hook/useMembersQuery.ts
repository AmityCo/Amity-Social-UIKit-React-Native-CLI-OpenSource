import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';

type Payload = {
  communityId: string;
  userIds: string[];
};

export function useMembersQuery() {
  const { mutate: removeMembers } = useMutation<boolean, Error, Payload>({
    mutationFn: ({ communityId, userIds }) =>
      CommunityRepository.Membership.removeMembers(communityId, userIds),
  });

  return {
    removeMembers,
  };
}
