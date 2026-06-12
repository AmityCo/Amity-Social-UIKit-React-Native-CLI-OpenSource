import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from '../useReactQueryLiveCollection';
import { QUERY_KEY } from '../../../../core/constants';

type UseUserCollection = {
  params: Parameters<typeof UserRepository.getUsers>[0];
  enabled?: boolean;
};

export const useUserCollection = ({
  params,
  enabled = true,
}: UseUserCollection) => {
  const query = useLiveCollection({
    key: [QUERY_KEY.USERS_COLLECTION, JSON.stringify(params)],
    params,
    fetcher: UserRepository.getUsers,
    enabled,
  });

  return {
    ...query,
    users: query.data,
  };
};
