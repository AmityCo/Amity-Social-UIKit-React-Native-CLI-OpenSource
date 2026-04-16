import { UserRepository } from '@amityco/ts-sdk-react-native';
import useLiveObject from '../useLiveObject';

type UseFollowInfoParams = {
  userId: Parameters<typeof UserRepository.Relationship.getFollowInfo>[0];
  enabled?: boolean;
};

export function useFollowInfo({ userId, enabled = true }: UseFollowInfoParams) {
  const { item, ...rest } = useLiveObject({
    fetcher: UserRepository.Relationship.getFollowInfo,
    params: userId,
    enabled: enabled && !!userId,
  });

  return { followInfo: item, ...rest };
}
