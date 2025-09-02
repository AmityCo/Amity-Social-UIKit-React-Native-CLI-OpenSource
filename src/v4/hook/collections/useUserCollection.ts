import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';

type UseUserCollection = {
  params?: Parameters<typeof UserRepository.getUsers>[0];
  enabled?: boolean;
};

export const useUserCollection = ({
  params,
  enabled = true,
}: UseUserCollection = {}) => {
  const query = useLiveCollection({
    key: ['users-collections'],
    params,
    fetcher: UserRepository.getUsers,
    enabled,
  });

  return {
    ...query,
    users: query.data,
  };
};
