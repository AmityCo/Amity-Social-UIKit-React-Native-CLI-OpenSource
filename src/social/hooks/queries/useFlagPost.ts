import { PostRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { TOAST } from '../../../core/constants';

type UseFlagPost = {
  postId: string;
  enabled?: boolean;
};

type FlagPostPayload = Awaited<ReturnType<typeof PostRepository.flagPost>>;

type FlagPostParam = Parameters<typeof PostRepository.flagPost>[0];

type UnflagPostPayload = Awaited<ReturnType<typeof PostRepository.unflagPost>>;

type UnflagPostParam = Parameters<typeof PostRepository.unflagPost>[0];

export const useFlagPost = ({ postId, enabled }: UseFlagPost) => {
  const { showToast } = useToast();

  const {
    data: isFlaggedByMe,
    isLoading,
    refetch,
  } = useQuery<boolean>({
    queryKey: ['PostRepository', 'isPostFlaggedByMe', postId],
    queryFn: () => PostRepository.isPostFlaggedByMe(postId),
    enabled: enabled && !!postId,
  });

  const { mutate: flagPostMutate } = useMutation<
    FlagPostPayload,
    Error,
    FlagPostParam
  >({
    mutationFn: PostRepository.flagPost,
  });

  const { mutate: unflagPostMutate } = useMutation<
    UnflagPostPayload,
    Error,
    UnflagPostParam
  >({
    mutationFn: PostRepository.unflagPost,
  });

  const reportPost = (targetPostId: string) => {
    flagPostMutate(targetPostId, {
      onSuccess: () => {
        refetch();
        showToast({
          type: 'success',
          message: TOAST.POST.REPORT.SUCCESS,
        });
      },
      onError: () =>
        showToast({
          type: 'informative',
          message: TOAST.POST.REPORT.FAILED,
        }),
    });
  };

  const unreportPost = (targetPostId: string) => {
    unflagPostMutate(targetPostId, {
      onSuccess: () => {
        refetch();
        showToast({
          type: 'success',
          message: TOAST.POST.UNREPORT.SUCCESS,
        });
      },
      onError: () =>
        showToast({
          type: 'informative',
          message: TOAST.POST.UNREPORT.FAILED,
        }),
    });
  };

  return {
    isLoading,
    isFlaggedByMe,
    reportPost,
    unreportPost,
  };
};
