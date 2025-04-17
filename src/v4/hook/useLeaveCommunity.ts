import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';

export const useLeaveCommunity = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { mutate: leaveCommunity, isPending } = useMutation({
    mutationFn: (communityId: string) =>
      CommunityRepository.leaveCommunity(communityId),
    onSuccess,
    onError,
  });

  return {
    leaveCommunity,
    isPending,
  };
};
