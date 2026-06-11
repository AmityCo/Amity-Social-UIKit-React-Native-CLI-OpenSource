import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// See notificationSettingsCompat: Client.notifications() is not in the public
// SDK yet; the compat wrapper keeps these screens compiling and failing
// gracefully on SDK builds without the API.
import { communityNotifications } from '../../features/community/shared/notificationSettingsCompat';

type CommunityNotificationSettingsQueryParams = {
  communityId: string;
};

type EnableParam = {
  communityId: string;
  events?: Amity.CommunityNotificationEvent[];
};

type EnablePayload = Amity.CommunityNotificationSettings;

type DisableParam = {
  communityId: string;
};

type DisablePayload = Amity.CommunityNotificationSettings;

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
    queryFn: () => communityNotifications(communityId).getSettings(),
    enabled: !!communityId,
  });

  const { mutateAsync: enableMutate, isPending: isEnablePending } = useMutation<
    EnablePayload,
    Error,
    EnableParam
  >({
    mutationFn: ({ communityId: id, events }) =>
      communityNotifications(id).enable(events),
    onSuccess: invalidate,
  });

  const { mutateAsync: disableMutate, isPending: isDisablePending } =
    useMutation<DisablePayload, Error, DisableParam>({
      mutationFn: ({ communityId: id }) => communityNotifications(id).disable(),
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
