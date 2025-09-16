import { PostRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';
import { QUERY_KEY } from '~/v4/constants';

type UsePinnedPostCollection = {
  params?: Parameters<typeof PostRepository.getPinnedPosts>[0];
  enabled?: boolean;
};

export const usePinnedPostCollection = ({
  params,
  enabled = true,
}: UsePinnedPostCollection = {}) => {
  const query = useLiveCollection({
    key: [QUERY_KEY.PINNED_POSTS_COLLECTION, JSON.stringify(params)],
    fetcher: PostRepository.getPinnedPosts,
    params,
    enabled,
  });

  return {
    ...query,
    pinnedPosts: query.data,
  };
};
