import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from '../useLiveCollection';

type UseFollowerCollectionParams = Parameters<
  typeof UserRepository.Relationship.getFollowers
>[0];

export function useFollowerCollection({
  userId,
  limit = 20,
  status = 'accepted',
}: UseFollowerCollectionParams) {
  const { items, ...rest } = useLiveCollection({
    fetcher: UserRepository.Relationship.getFollowers,
    params: { userId, limit, status },
    enabled: !!userId,
  });

  return { ...rest, followers: items };
}
