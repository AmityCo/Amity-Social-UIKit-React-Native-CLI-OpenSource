import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import useLiveObject from './useLiveObject';

type UseCommunityParams = {
  communityId: Parameters<typeof CommunityRepository.getCommunity>[0];
  enabled?: boolean;
};

export function useCommunity({
  communityId,
  enabled = true,
}: UseCommunityParams) {
  const { item, ...rest } = useLiveObject({
    fetcher: CommunityRepository.getCommunity,
    params: communityId,
    enabled: enabled && !!communityId,
  });

  return { community: item, ...rest };
}
