import { useEffect, useMemo, useState } from 'react';
import { PollRepository } from '@amityco/ts-sdk-react-native';
import { useToast } from '../../core/stores/slices/toastSlice';

const POLL_ERROR = {
  POLL_CLOSED: 'Poll was closed',
  POLL_NOT_FOUND: 'Poll not found',
} as const;

export const usePoll = (pollId: string) => {
  const [poll, setPoll] = useState<Amity.Poll | undefined>(undefined);
  const [isAuthorSeeingResults, setIsAuthorSeeingResults] = useState(false);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const isPollClosed = useMemo(() => {
    return poll?.status === 'closed';
  }, [poll]);

  const isAlreadyVoted = useMemo(() => {
    return poll?.isVoted;
  }, [poll]);

  const totalVotes = useMemo(() => {
    const total = poll?.answers?.reduce((acc, answer) => {
      return acc + answer.voteCount;
    }, 0);
    return total;
  }, [poll]);

  useEffect(() => {
    PollRepository.getPoll(pollId, ({ data, loading: pollLoading }) => {
      setPoll(data);
      setLoading(pollLoading);
    });
  }, [pollId]);

  const handlePollError = (error: Error) => {
    if (error?.message?.includes(POLL_ERROR.POLL_CLOSED)) {
      showToast({ type: 'informative', message: 'Poll ended.' });
    } else if (error?.message?.includes(POLL_ERROR.POLL_NOT_FOUND)) {
      showToast({
        type: 'informative',
        message: 'This poll is no longer available.',
      });
    } else {
      showToast({ type: 'failed', message: 'Oops, something went wrong.' });
    }
  };

  const votePoll = async (answerIds: string[]) => {
    try {
      await PollRepository.votePoll(pollId, answerIds);
    } catch (error) {
      handlePollError(error as Error);
    }
  };

  const unvotePoll = async () => {
    try {
      await PollRepository.unvotePoll(pollId);
      showToast({ type: 'success', message: 'Vote removed.' });
    } catch (error) {
      handlePollError(error as Error);
    }
  };

  return {
    poll,
    loading,
    votePoll,
    unvotePoll,
    totalVotes,
    isPollClosed,
    isAlreadyVoted,
    isAuthorSeeingResults,
    setIsAuthorSeeingResults,
  };
};
