import { PostRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';
import { QUERY_KEY } from '~/v4/constants';

type UsePostCollection = {
  params?: Parameters<typeof PostRepository.getPosts>[0];
  enabled?: boolean;
};

export const usePostCollection = ({
  params,
  enabled = true,
}: UsePostCollection = {}) => {
  const query = useLiveCollection({
    key: [QUERY_KEY.POSTS_COLLECTION, JSON.stringify(params)],
    params,
    fetcher: PostRepository.getPosts,
    enabled,
  });

  return {
    ...query,
    posts: query.data,
  };
};
