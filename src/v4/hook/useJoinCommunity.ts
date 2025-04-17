// useJoinCommunity.ts
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';

export const useJoinCommunity = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { mutate: joinCommunity, isPending } = useMutation({
    mutationFn: (communityId: string) =>
      CommunityRepository.joinCommunity(communityId),
    onSuccess,
    onError,
  });

  return {
    joinCommunity,
    isPending,
  };
};
