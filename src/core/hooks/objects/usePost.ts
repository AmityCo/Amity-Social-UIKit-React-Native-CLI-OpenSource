import { PostRepository } from '@amityco/ts-sdk-react-native';
import useLiveObject from './useLiveObject';

type UsePostParams = {
  postId: Parameters<typeof PostRepository.getPost>[0];
  enabled?: boolean;
};

export function usePost({ postId, enabled = true }: UsePostParams) {
  const { item, ...rest } = useLiveObject({
    fetcher: PostRepository.getPost,
    params: postId,
    enabled: enabled && !!postId,
  });

  return { post: item, ...rest };
}
