import { useEffect, useMemo, useState } from 'react';
import { PollRepository } from '@amityco/ts-sdk-react-native';
import { useToast } from '../stores/slices/toast';

export const usePoll = (pollId: string) => {
  const [poll, setPoll] = useState<Amity.Poll | undefined>(undefined);
  const [isAuthorSeeingResults, setIsAuthorSeeingResults] = useState(false);
  const { showToast } = useToast();

  const isPollClosed = useMemo(() => {
    return poll?.status === 'closed';
  }, [poll]);

  const isAlreadyVoted = useMemo(() => {
    return poll?.isVoted;
  }, [poll]);

  const totalVotes = useMemo(() => {
    const total = poll?.answers.reduce((acc, answer) => {
      return acc + answer.voteCount;
    }, 0);
    return total;
  }, [poll]);

  useEffect(() => {
    PollRepository.getPoll(pollId, ({ data }) => setPoll(data));
  }, [pollId]);

  const votePoll = async (answerIds: string[]) => {
    try {
      await PollRepository.votePoll(pollId, answerIds);
    } catch (error) {
      showToast({ type: 'failed', message: 'Oops, something went wrong.' });
    }
  };

  return {
    poll,
    votePoll,
    totalVotes,
    isPollClosed,
    isAlreadyVoted,
    isAuthorSeeingResults,
    setIsAuthorSeeingResults,
  };
};
