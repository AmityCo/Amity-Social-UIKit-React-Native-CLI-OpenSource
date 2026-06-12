import { FeedRepository, PostContentType } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from '../useLiveCollection';

type UseUserFeedParams = Parameters<typeof FeedRepository.getUserFeed>[0];

export default function useUserFeed<
  T extends Amity.PostContentType = ValueOf<typeof PostContentType>
>({
  userId,
  limit = 20,
  enabled = true,
  ...params
}: UseUserFeedParams & { enabled?: boolean }) {
  const { items, ...rest } = useLiveCollection({
    fetcher: FeedRepository.getUserFeed,
    params: { userId, limit, ...params },
    enabled: enabled && !!userId,
  });

  const filteredPosts = items?.filter((post) => {
    const hasFileOrAudioChild = post?.childrenPosts?.some(
      (child) => child.dataType === 'file' || child.dataType === 'audio'
    );
    return !hasFileOrAudioChild;
  });

  return {
    ...rest,
    posts: filteredPosts as Amity.Post<T>[],
  };
}
