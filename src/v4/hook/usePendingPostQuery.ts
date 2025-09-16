import { useMutation } from '@tanstack/react-query';
import { useToast } from '../stores/slices/toast';
import { PostRepository } from '@amityco/ts-sdk-react-native';

type DeletePostResponse = Awaited<ReturnType<typeof PostRepository.deletePost>>;

type DeletePostPayload = Parameters<typeof PostRepository.deletePost>[0];

type ApprovePostResponse = Awaited<
  ReturnType<typeof PostRepository.approvePost>
>;

type ApprovePostPayload = Parameters<typeof PostRepository.approvePost>[0];

type DeclinePostResponse = Awaited<
  ReturnType<typeof PostRepository.declinePost>
>;

type DeclinePostPayload = Parameters<typeof PostRepository.declinePost>[0];

export const usePendingPostQuery = () => {
  const { showToast } = useToast();

  const { mutate: deletePost } = useMutation<
    DeletePostResponse,
    Error,
    DeletePostPayload
  >({
    mutationFn: PostRepository.deletePost,
    onSuccess: () => {
      showToast({ type: 'success', message: 'Post deleted.' });
    },
    onError: () => {
      showToast({ type: 'informative', message: 'Failed to delete post.' });
    },
  });

  const { mutate: approvePost } = useMutation<
    ApprovePostResponse,
    Error,
    ApprovePostPayload
  >({
    mutationFn: PostRepository.approvePost,
    onSuccess: () => {
      showToast({ type: 'success', message: 'Post accepted.' });
    },
    onError: () => {
      showToast({
        type: 'informative',
        message:
          'Failed to accept post. This post has been reviewed by another moderator.',
      });
    },
  });

  const { mutate: declinePost } = useMutation<
    DeclinePostResponse,
    Error,
    DeclinePostPayload
  >({
    mutationFn: PostRepository.declinePost,
    onSuccess: () => {
      showToast({ type: 'success', message: 'Post declined.' });
    },
    onError: () => {
      showToast({
        type: 'informative',
        message:
          'Failed to decline post. This post has been reviewed by another moderator.',
      });
    },
  });

  return {
    deletePost,
    approvePost,
    declinePost,
  };
};
