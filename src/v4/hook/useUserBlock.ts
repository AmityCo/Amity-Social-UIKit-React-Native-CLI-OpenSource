import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useToast } from '~/v4/stores/slices/toast';
import { useFollowUserStatus } from './useFollowUserStatus';

export const useUserBlock = (userId: string) => {
  const { showToast } = useToast();
  const { refetch } = useFollowUserStatus({ userId });
  const { mutateAsync: blockUser } = useMutation({
    mutationFn: () => {
      return UserRepository.Relationship.blockUser(userId);
    },

    onSuccess: () => {
      refetch();
    },

    onError: () => {
      showToast({
        type: 'informative',
        message: 'Oops, something went wrong.',
      });
    },
  });

  const { mutateAsync: unblockUser } = useMutation({
    mutationFn: () => {
      return UserRepository.Relationship.unBlockUser(userId);
    },
    onSuccess: () => {
      refetch();
      showToast({
        type: 'success',
        message: 'User unblocked.',
      });
    },
    onError: () => {
      showToast({
        type: 'informative',
        message: 'Oops, something went wrong.',
      });
    },
  });

  const block = (displayName: string) => {
    return Alert.alert(
      'Block user?',
      `${displayName} won't be able to see posts and comments that you've created. They won't be notified that you've blocked them.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => blockUser(),
        },
      ]
    );
  };

  const unblock = (displayName: string) => {
    return Alert.alert(
      'Unblock user?',
      `${displayName} will now be able to see posts and comments that you've created. They won't be notified that you've unblocked them.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          onPress: () => unblockUser(),
        },
      ]
    );
  };

  return {
    blockUser: block,
    unblockUser: unblock,
  };
};
