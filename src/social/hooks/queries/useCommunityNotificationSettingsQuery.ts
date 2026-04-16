import { Client } from '@amityco/ts-sdk-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type CommunityNotificationSettingsQueryParams = {
  communityId: string;
};

type EnableParam = {
  communityId: Parameters<
    ReturnType<typeof Client.notifications>['community']
  >[0];
  events?: Parameters<
    ReturnType<ReturnType<typeof Client.notifications>['community']>['enable']
  >[0];
};

type EnablePayload = Awaited<
  ReturnType<
    ReturnType<ReturnType<typeof Client.notifications>['community']>['enable']
  >
>;

type DisableParam = {
  communityId: Parameters<
    ReturnType<typeof Client.notifications>['community']
  >[0];
};

type DisablePayload = Awaited<
  ReturnType<
    ReturnType<ReturnType<typeof Client.notifications>['community']>['disable']
  >
>;

export function useCommunityNotificationSettingsQuery({
  communityId,
}: CommunityNotificationSettingsQueryParams) {
  const queryClient = useQueryClient();

  const queryKey = ['communityNotificationSettings', communityId];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => Client.notifications().community(communityId).getSettings(),
    enabled: !!communityId,
  });

  const { mutateAsync: enableMutate, isPending: isEnablePending } = useMutation<
    EnablePayload,
    Error,
    EnableParam
  >({
    mutationFn: ({ communityId: id, events }) =>
      Client.notifications().community(id).enable(events),
    onSuccess: invalidate,
  });

  const { mutateAsync: disableMutate, isPending: isDisablePending } =
    useMutation<DisablePayload, Error, DisableParam>({
      mutationFn: ({ communityId: id }) =>
        Client.notifications().community(id).disable(),
      onSuccess: invalidate,
    });

  return {
    data,
    isLoading,
    enableNotifications: enableMutate,
    disableNotifications: disableMutate,
    isPending: isEnablePending || isDisablePending,
  };
}
