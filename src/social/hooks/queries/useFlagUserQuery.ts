import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { TOAST } from '../../../core/constants';

type UseUserFlaggedByMe = {
  enabled?: boolean;
  userId: string;
};

type FlagUserPayload = Awaited<ReturnType<typeof UserRepository.flagUser>>;

type FlagUserParam = Parameters<typeof UserRepository.flagUser>[0];

type UnflagUserPayload = Awaited<ReturnType<typeof UserRepository.unflagUser>>;

type UnflagUserParam = Parameters<typeof UserRepository.unflagUser>[0];

export const useUserFlaggedByMeQuery = ({
  userId,
  enabled,
}: UseUserFlaggedByMe) => {
  const { showToast } = useToast();

  const {
    data: isFlaggedByMe,
    isLoading,
    refetch,
  } = useQuery<boolean>({
    queryKey: ['UserRepository', 'isUserFlaggedByMe', userId],
    queryFn: () => UserRepository.isUserFlaggedByMe(userId),
    enabled: enabled && !!userId,
  });

  const { mutate: flagUserMutate } = useMutation<
    FlagUserPayload,
    Error,
    FlagUserParam
  >({
    mutationFn: UserRepository.flagUser,
  });

  const { mutate: unflagUserMutate } = useMutation<
    UnflagUserPayload,
    Error,
    UnflagUserParam
  >({
    mutationFn: UserRepository.unflagUser,
  });

  const reportUser = (targetUserId: string) => {
    flagUserMutate(targetUserId, {
      onSuccess: () => {
        refetch();
        showToast({
          type: 'success',
          message: TOAST.USER.REPORT.SUCCESS,
        });
      },
      onError: () =>
        showToast({
          type: 'informative',
          message: TOAST.USER.REPORT.FAILED,
        }),
    });
  };

  const unreportUser = (targetUserId: string) => {
    unflagUserMutate(targetUserId, {
      onSuccess: () => {
        refetch();
        showToast({
          type: 'success',
          message: TOAST.USER.UNREPORT.SUCCESS,
        });
      },
      onError: () =>
        showToast({
          type: 'informative',
          message: TOAST.USER.UNREPORT.FAILED,
        }),
    });
  };

  return {
    isLoading,
    isFlaggedByMe,
    reportUser,
    unreportUser,
  };
};
