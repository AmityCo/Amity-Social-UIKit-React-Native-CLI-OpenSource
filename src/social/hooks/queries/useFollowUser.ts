import { Alert } from 'react-native';
import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { ALERT, TOAST } from '../../../core/constants';

type FollowPayload = Awaited<
  ReturnType<typeof UserRepository.Relationship.follow>
>;

type FollowParam = Parameters<typeof UserRepository.Relationship.follow>[0];

type UnfollowPayload = Awaited<
  ReturnType<typeof UserRepository.Relationship.unfollow>
>;

type UnfollowParam = Parameters<typeof UserRepository.Relationship.unfollow>[0];

export const useFollowUser = () => {
  const { showToast } = useToast();

  const { mutate: followMutate, isPending: isFollowPending } = useMutation<
    FollowPayload,
    Error,
    FollowParam
  >({
    mutationFn: UserRepository.Relationship.follow,
  });

  const { mutate: unfollowMutate, isPending: isUnfollowPending } = useMutation<
    UnfollowPayload,
    Error,
    UnfollowParam
  >({
    mutationFn: UserRepository.Relationship.unfollow,
  });

  const followUser = (userId: string) => {
    followMutate(userId, {
      onError: () => {
        Alert.alert(ALERT.USER.FOLLOW.TITLE, ALERT.USER.FOLLOW.MESSAGE, [
          { text: ALERT.ACTION.OK },
        ]);
      },
    });
  };

  const unfollow = (userId: string) =>
    unfollowMutate(userId, {
      onError: () =>
        showToast({ type: 'informative', message: TOAST.USER.UNFOLLOW.FAILED }),
    });

  const unfollowUser = (userId: string, options?: { confirm?: boolean }) => {
    if (options?.confirm) {
      Alert.alert(ALERT.USER.UNFOLLOW.TITLE, ALERT.USER.UNFOLLOW.MESSAGE, [
        { text: ALERT.ACTION.CANCEL, style: 'cancel' },
        {
          text: ALERT.ACTION.UNFOLLOW,
          style: 'destructive',
          onPress: () => unfollow(userId),
        },
      ]);
    } else {
      unfollow(userId);
    }
  };

  return {
    followUser,
    unfollowUser,
    isLoading: isFollowPending || isUnfollowPending,
  };
};
