import { useState } from 'react';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

export const useJoinCommunity = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) => {
  const [isPending, setIsPending] = useState(false);

  const joinCommunity = async (communityId: string) => {
    setIsPending(true);
    try {
      await CommunityRepository.joinCommunity(communityId);
      setIsPending(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setIsPending(false);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return {
    joinCommunity,
    isPending,
  };
};
