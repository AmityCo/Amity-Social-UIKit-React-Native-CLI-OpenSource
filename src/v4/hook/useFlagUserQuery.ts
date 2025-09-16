import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';

type UseUserFlaggedByMe = {
  enabled?: boolean;
  userId: string;
};

export const useUserFlaggedByMeQuery = ({
  userId,
  enabled,
}: UseUserFlaggedByMe) => {
  const {
    data: isFlaggedByMe,
    isLoading,
    refetch,
  } = useQuery<boolean>({
    queryKey: ['UserRepository', 'isUserFlaggedByMe', userId],
    queryFn: () => UserRepository.isUserFlaggedByMe(userId),
    enabled: enabled && !!userId,
  });

  const { mutate: flagUser } = useMutation<boolean, Error, string>({
    mutationFn: UserRepository.flagUser,
  });

  const { mutate: unflagUser } = useMutation<boolean, Error, string>({
    mutationFn: UserRepository.unflagUser,
  });

  return {
    isLoading,
    isFlaggedByMe,
    flagUser,
    unflagUser,
    refetch,
  };
};
