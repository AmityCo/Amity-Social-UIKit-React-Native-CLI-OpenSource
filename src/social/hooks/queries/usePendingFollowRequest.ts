import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { TOAST } from '../../../core/constants';

type AcceptPayload = Awaited<
  ReturnType<typeof UserRepository.Relationship.acceptMyFollower>
>;
type AcceptParam = Parameters<
  typeof UserRepository.Relationship.acceptMyFollower
>[0];

type DeclinePayload = Awaited<
  ReturnType<typeof UserRepository.Relationship.declineMyFollower>
>;
type DeclineParam = Parameters<
  typeof UserRepository.Relationship.declineMyFollower
>[0];

export function usePendingFollowRequest() {
  const { showToast } = useToast();

  const { mutate: acceptMutate, isPending: isAcceptPending } = useMutation<
    AcceptPayload,
    Error,
    AcceptParam
  >({
    mutationFn: UserRepository.Relationship.acceptMyFollower,
  });

  const { mutate: declineMutate, isPending: isDeclinePending } = useMutation<
    DeclinePayload,
    Error,
    DeclineParam
  >({
    mutationFn: UserRepository.Relationship.declineMyFollower,
  });

  const acceptRequest = (userId: string, displayName: string) => {
    acceptMutate(userId, {
      onSuccess: () => {
        showToast({
          type: 'success',
          message: TOAST.USER.FOLLOW_REQUEST.ACCEPT.SUCCESS(displayName),
        });
      },
    });
  };

  const declineRequest = (userId: string) => {
    declineMutate(userId, {
      onSuccess: () => {
        showToast({
          type: 'success',
          message: TOAST.USER.FOLLOW_REQUEST.DECLINE.SUCCESS,
        });
      },
    });
  };

  return {
    acceptRequest,
    declineRequest,
    isLoading: isAcceptPending || isDeclinePending,
  };
}
