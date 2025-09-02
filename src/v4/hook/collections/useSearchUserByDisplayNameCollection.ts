import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';

type UseSearchUserByDisplayNameCollection = {
  params?: Parameters<typeof UserRepository.searchUserByDisplayName>[0];
  enabled?: boolean;
};

export const useSearchUserByDisplayNameCollection = ({
  params,
  enabled = true,
}: UseSearchUserByDisplayNameCollection = {}) => {
  const query = useLiveCollection({
    key: ['search-users-by-display-name-collections', params.displayName],
    params,
    fetcher: UserRepository.searchUserByDisplayName,
    enabled,
  });

  return {
    ...query,
    searchUsers: query.data,
  };
};
