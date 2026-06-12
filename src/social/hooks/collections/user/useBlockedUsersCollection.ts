import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from '../useLiveCollection';

type UseBlockedUsersCollectionParams = Parameters<
  typeof UserRepository.getBlockedUsers
>[0];

export function useBlockedUsersCollection({
  limit = 20,
}: UseBlockedUsersCollectionParams) {
  const { items, ...rest } = useLiveCollection({
    fetcher: UserRepository.getBlockedUsers,
    params: { limit },
  });

  return { ...rest, blockedUsers: items };
}
