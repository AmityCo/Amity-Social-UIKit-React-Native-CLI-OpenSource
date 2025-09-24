import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert } from 'react-native';

type UseFollowUserStatus = {
  enabled?: boolean;
  userId: string;
};

type FollowInfo = {
  followerCount: number;
  followingCount: number;
  pendingCount: number;
  status: Amity.FollowStatus['status'];
};

export const useFollowUserStatus = ({
  userId,
  enabled = true,
}: UseFollowUserStatus) => {
  const {
    data: followInfo,
    isLoading,
    refetch,
  } = useQuery<FollowInfo>({
    queryKey: ['UserRepository', 'getFollowInfo', userId],
    queryFn: () => {
      return new Promise<FollowInfo>((resolve, reject) => {
        if (!userId) {
          reject(new Error('userId is required'));
          return;
        }

        const unsubscribe = UserRepository.Relationship.getFollowInfo(
          userId,
          (response) => {
            if (response.error) {
              reject(response.error);
              return;
            }

            if (!response.loading && response.data) {
              resolve({
                followerCount: response.data.followerCount,
                followingCount: response.data.followingCount,
                pendingCount: response.data.pendingCount,
                status: response.data.status,
              });
              unsubscribe?.();
            }
          }
        );
      });
    },
    enabled: enabled && !!userId,
  });

  const { mutate: followUser } = useMutation<any, Error, string>({
    mutationFn: UserRepository.Relationship.follow,
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      return Alert.alert(
        'Unable to follow this user',
        'Oops! something went wrong. Please try again later.'
      );
    },
  });

  const { mutate: unfollowUser } = useMutation<any, Error, string>({
    mutationFn: UserRepository.Relationship.unfollow,
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: acceptFollowRequest } = useMutation<any, Error, string>({
    mutationFn: UserRepository.Relationship.acceptMyFollower,
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: declineFollowRequest } = useMutation<any, Error, string>({
    mutationFn: UserRepository.Relationship.declineMyFollower,
    onSuccess: () => {
      refetch();
    },
  });

  return {
    isLoading,
    followerCount: followInfo?.followerCount,
    followingCount: followInfo?.followingCount,
    pendingCount: followInfo?.pendingCount,
    followStatus: followInfo?.status,
    followUser,
    unfollowUser,
    acceptFollowRequest,
    declineFollowRequest,
    refetch,
  };
};
