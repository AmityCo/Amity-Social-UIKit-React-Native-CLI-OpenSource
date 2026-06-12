import { PollRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { ALERT, TOAST } from '../../../core/constants';

type ClosePollPayload = Awaited<ReturnType<typeof PollRepository.closePoll>>;

type ClosePollParam = Parameters<typeof PollRepository.closePoll>[0];

export const useClosePoll = () => {
  const { showToast } = useToast();

  const { mutate: closePollMutate, isPending } = useMutation<
    ClosePollPayload,
    Error,
    ClosePollParam
  >({
    mutationFn: PollRepository.closePoll,
  });

  const closePoll = async (pollId: string) => {
    Alert.alert(ALERT.POLL.CLOSE.TITLE, ALERT.POLL.CLOSE.MESSAGE, [
      {
        text: ALERT.ACTION.CANCEL,
        style: 'cancel',
      },
      {
        text: ALERT.POLL.CLOSE.ACTION,
        style: 'destructive',
        onPress: () => {
          if (!isPending) {
            closePollMutate(pollId, {
              onSuccess: () => {
                showToast({
                  type: 'success',
                  message: TOAST.POLL.CLOSE.SUCCESS,
                });
              },
              onError: () => {
                showToast({
                  type: 'failed',
                  message: TOAST.POLL.CLOSE.FAILED,
                });
              },
            });
          }
        },
      },
    ]);
  };

  return { closePoll };
};
