import { useState } from 'react';
import { PollRepository } from '@amityco/ts-sdk-react-native';

type ClosePoll = {
  pollId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useClosePoll = () => {
  const [isLoading, setIsLoading] = useState(false);

  const closePoll = async ({ onError, onSuccess, pollId }: ClosePoll) => {
    setIsLoading(true);
    try {
      await PollRepository.closePoll(pollId);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, closePoll };
};
