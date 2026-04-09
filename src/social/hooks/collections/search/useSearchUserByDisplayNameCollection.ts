import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from '../useReactQueryLiveCollection';
import { QUERY_KEY } from '../../../../core/constants';

type UseSearchUserByDisplayNameCollection = {
  params: Parameters<typeof UserRepository.searchUserByDisplayName>[0];
  enabled?: boolean;
};

export const useSearchUserByDisplayNameCollection = ({
  params,
  enabled = true,
}: UseSearchUserByDisplayNameCollection) => {
  const query = useLiveCollection({
    key: [
      QUERY_KEY.SEARCH_USERS_BY_DISPLAY_NAME_COLLECTION,
      JSON.stringify(params),
    ],
    params,
    fetcher: UserRepository.searchUserByDisplayName,
    enabled,
  });

  return {
    ...query,
    searchUsers: query.data,
  };
};
