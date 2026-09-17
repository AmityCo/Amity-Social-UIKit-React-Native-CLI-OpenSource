// useUser — one user, resolved by id through a `UserRepository.getUser` live
// object. Lives in core because both surfaces need it: chat must not import
// from social (CLAUDE.md). Moved here from `social/hooks/objects/user/`.

import { UserRepository } from '@amityco/ts-sdk-react-native';
import useLiveObject from './useLiveObject';

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
