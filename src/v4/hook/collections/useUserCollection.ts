import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';
import { QUERY_KEY } from '~/v4/constants';

type UseUserCollection = {
  params?: Parameters<typeof UserRepository.getUsers>[0];
  enabled?: boolean;
};

export const useUserCollection = ({
  params,
  enabled = true,
}: UseUserCollection = {}) => {
  const query = useLiveCollection({
    key: [QUERY_KEY.USERS_COLLECTION],
    params,
    fetcher: UserRepository.getUsers,
    enabled,
  });

  return {
    ...query,
    users: query.data,
  };
};
