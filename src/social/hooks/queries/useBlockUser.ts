import { Alert } from 'react-native';
import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { ALERT, TOAST } from '../../../core/constants';

type BlockUserPayload = Awaited<
  ReturnType<typeof UserRepository.Relationship.blockUser>
>;

type BlockUserParam = Parameters<
  typeof UserRepository.Relationship.blockUser
>[0];

type UnblockUserPayload = Awaited<
  ReturnType<typeof UserRepository.Relationship.unBlockUser>
>;

type UnblockUserParam = Parameters<
  typeof UserRepository.Relationship.unBlockUser
>[0];

export const useBlockUser = () => {
  const { showToast } = useToast();

  const { mutate: blockUserMutate } = useMutation<
    BlockUserPayload,
    Error,
    BlockUserParam
  >({
    mutationFn: UserRepository.Relationship.blockUser,
  });

  const { mutate: unBlockUserMutate } = useMutation<
    UnblockUserPayload,
    Error,
    UnblockUserParam
  >({
    mutationFn: UserRepository.Relationship.unBlockUser,
  });

  const blockUser = (userId: string, displayName: string) => {
    Alert.alert(ALERT.USER.BLOCK.TITLE, ALERT.USER.BLOCK.MESSAGE(displayName), [
      { text: ALERT.ACTION.CANCEL, style: 'cancel' },
      {
        text: ALERT.ACTION.BLOCK,
        style: 'destructive',
        onPress: () => {
          blockUserMutate(userId, {
            onSuccess: () => {
              showToast({
                type: 'success',
                message: TOAST.USER.BLOCK.SUCCESS,
              });
            },
            onError: () => {
              showToast({
                type: 'informative',
                message: TOAST.USER.BLOCK.FAILED,
              });
            },
          });
        },
      },
    ]);
  };

  const unBlockUser = (userId: string, displayName: string) => {
    Alert.alert(
      ALERT.USER.UNBLOCK.TITLE,
      ALERT.USER.UNBLOCK.MESSAGE(displayName),
      [
        { text: ALERT.ACTION.CANCEL, style: 'cancel' },
        {
          text: ALERT.ACTION.UNBLOCK,
          style: 'destructive',
          onPress: () => {
            unBlockUserMutate(userId, {
              onSuccess: () => {
                showToast({
                  type: 'success',
                  message: TOAST.USER.UNBLOCK.SUCCESS,
                });
              },
              onError: () => {
                showToast({
                  type: 'informative',
                  message: TOAST.USER.UNBLOCK.FAILED,
                });
              },
            });
          },
        },
      ]
    );
  };

  return {
    blockUser,
    unBlockUser,
  };
};
