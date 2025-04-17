import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useState } from 'react';

export const useLeaveCommunity = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) => {
  const [isPending, setIsPending] = useState(false);

  const leaveCommunity = async (communityId: string) => {
    setIsPending(true);
    try {
      await CommunityRepository.leaveCommunity(communityId);
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
    leaveCommunity,
    isPending,
  };
};
