import { UserRepository } from '@amityco/ts-sdk-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';

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
  const queryClient = useQueryClient();
  const [followInfo, setFollowInfo] = useState<FollowInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId || !enabled) {
      return undefined;
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setIsLoading(true);

    const unsubscribe = UserRepository.Relationship.getFollowInfo(
      userId,
      (response) => {
        if (response.error) {
          setIsLoading(false);
          return;
        }

        if (!response.loading && response.data) {
          const newFollowInfo = {
            followerCount: response.data.followerCount,
            followingCount: response.data.followingCount,
            pendingCount: response.data.pendingCount,
            status: response.data.status,
          };

          setFollowInfo(newFollowInfo);
          setIsLoading(false);

          const queryKey = ['UserRepository', 'getFollowInfo', userId];
          queryClient.setQueryData(queryKey, newFollowInfo);
        }
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId, enabled, queryClient]);

  const refetch = useCallback(() => {
    const queryKey = ['UserRepository', 'getFollowInfo', userId];
    queryClient.invalidateQueries({ queryKey });

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setIsLoading(true);
    const unsubscribe = UserRepository.Relationship.getFollowInfo(
      userId,
      (response) => {
        if (response.error) {
          setIsLoading(false);
          return;
        }

        if (!response.loading && response.data) {
          const newFollowInfo = {
            followerCount: response.data.followerCount,
            followingCount: response.data.followingCount,
            pendingCount: response.data.pendingCount,
            status: response.data.status,
          };

          setFollowInfo(newFollowInfo);
          setIsLoading(false);
          queryClient.setQueryData(queryKey, newFollowInfo);
        }
      }
    );

    unsubscribeRef.current = unsubscribe;
  }, [userId, queryClient]);

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
