import { UserRepository } from '@amityco/ts-sdk-react-native';
import useLiveObject from '../useLiveObject';

type UseUserParams = {
  userId: Parameters<typeof UserRepository.getUser>[0];
  enabled?: boolean;
};

export function useUser({ userId, enabled = true }: UseUserParams) {
  const { item, ...rest } = useLiveObject({
    fetcher: UserRepository.getUser,
    params: userId,
    enabled: enabled && !!userId,
  });

  return { user: item, ...rest };
}
