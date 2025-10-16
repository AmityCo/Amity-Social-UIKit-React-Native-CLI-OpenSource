import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';
import { QUERY_KEY } from '~/v4/constants';

type UseSearchMemberByDisplayNameCollection = {
  params?: Parameters<typeof CommunityRepository.Membership.searchMembers>[0];
  enabled?: boolean;
};

export const useSearchMemberByDisplayNameCollection = ({
  params,
  enabled = true,
}: UseSearchMemberByDisplayNameCollection = {}) => {
  const query = useLiveCollection({
    key: [
      QUERY_KEY.SEARCH_MEMBER_BY_DISPLAY_NAME_COLLECTION,
      params.search,
      params.communityId,
    ],
    params,
    fetcher: CommunityRepository.Membership.searchMembers,
    enabled,
  });

  return {
    ...query,
    searchMembers: query.data,
  };
};
