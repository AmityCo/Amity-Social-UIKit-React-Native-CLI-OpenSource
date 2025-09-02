import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';

type UseCommunityMemberCollection = {
  params?: Parameters<typeof CommunityRepository.Membership.getMembers>[0];
  enabled?: boolean;
};

export const useCommunityMemberCollection = ({
  params,
  enabled = true,
}: UseCommunityMemberCollection = {}) => {
  const query = useLiveCollection({
    key: ['community-members-collections'],
    params,
    fetcher: CommunityRepository.Membership.getMembers,
    enabled,
  });

  return {
    ...query,
    members: query.data,
  };
};
