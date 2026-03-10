import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from '../useLiveCollection';

type UseFollowingCollectionParams = Parameters<
  typeof UserRepository.Relationship.getFollowings
>[0];

export function useFollowingCollection({
  userId,
  limit = 20,
  status = 'accepted',
}: UseFollowingCollectionParams) {
  const { items, ...rest } = useLiveCollection({
    fetcher: UserRepository.Relationship.getFollowings,
    params: { userId, limit, status },
    enabled: !!userId,
  });

  return { ...rest, followings: items };
}
