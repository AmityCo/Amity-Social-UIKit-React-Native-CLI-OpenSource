import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';
import { QUERY_KEY } from '~/v4/constants';

type UseCommunityMemberCollection = {
  params?: Parameters<typeof CommunityRepository.Membership.getMembers>[0];
  enabled?: boolean;
};

export const useCommunityMemberCollection = ({
  params,
  enabled = true,
}: UseCommunityMemberCollection = {}) => {
  const query = useLiveCollection({
    key: [QUERY_KEY.COMMUNITY_MEMBERS_COLLECTION, JSON.stringify(params)],
    params,
    fetcher: CommunityRepository.Membership.getMembers,
    enabled,
  });

  return {
    ...query,
    members: query.data,
  };
};
