// useNotificationPreference — RN port of AmityUiKitWeb
// v4/chat/features/group/notification-preference/hooks/useNotificationPreference.
// Owns the "allow notifications" toggle: the persisted channel push-notification
// setting, the enable/disable mutation, and the moderator-silenced state.
//
// RN adaptations from web:
//   - Web imports `useChannelPushNotificationQuery` / `useChannelObject` from
//     `chat/hooks/queries` + `chat/hooks/objects`. Those query layers have no RN
//     counterpart (they are not tracked port units), so the same calls are made
//     inline here with the identical SDK surface:
//       • read/enable/disable → `Client.notifications().channel(id)` (the exact
//         API the RN community notification port already uses).
//       • `channel.notificationMode` (for `isSilent`) → an inline
//         `ChannelRepository.getChannel` live subscription gated on
//         `useAuth().isConnected` (the sibling edit-permission port's pattern).
//   - react-hook-form + zod + @tanstack/react-query are all kept 1:1 with web
//     (all three are present in the RN app).
//   - Web `useChatNavigation().pop()` → React Navigation `goBack`.
//   - Web `useNotifications('chat').success/error` → the redux toast (`useToast`).

// 1. React / RN imports
import { useEffect, useState } from 'react';

// 2. Third-party imports
import {
  ChannelRepository,
  Client,
  AmityChannelNotificationModeEnum,
} from '@amityco/ts-sdk-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import useAuth from '../../../../../../../core/hooks/useAuth';
import { useString } from '../../../../../../../core/localization';
import { useToast } from '../../../../../../../core/stores/slices/toastSlice';

// Web `CHANNEL_PUSH_NOTIFICATION_QUERY_KEY`.
const CHANNEL_PUSH_NOTIFICATION_QUERY_KEY = 'channelPushNotification';

const schema = z.object({
  isEnabled: z.boolean(),
});

type NotificationPreferenceForm = z.infer<typeof schema>;

// 4. Types
export type NotificationPreferenceProps = {
  channelId: string;
};

type UpdateChannelPushNotificationPayload = {
  channelId: string;
  isEnabled: boolean;
};

// 5. Hook
export function useNotificationPreference({
  channelId,
}: NotificationPreferenceProps) {
  const { isConnected } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Web `useChannelPushNotificationQuery` mute/unmute toasts.
  const muteSuccess = useString('amity_chat_action_mute');
  const muteError = useString('amity_chat_action_mute_failed');
  const unmuteSuccess = useString('amity_chat_action_unmute');
  const unmuteError = useString('amity_chat_action_unmute_failed');

  // Web `useChannelObject` → inline live channel subscription (for notificationMode).
  const [channel, setChannel] = useState<Amity.Channel | undefined>(undefined);
  const [isChannelLoading, setIsChannelLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !channelId) return undefined;
    setIsChannelLoading(true);
    const unsub = ChannelRepository.getChannel(
      channelId,
      ({ data, loading }) => {
        if (data) setChannel(data);
        if (loading === false) setIsChannelLoading(false);
      }
    );
    return () => {
      unsub();
    };
  }, [isConnected, channelId]);

  // Web `useChannelPushNotificationQuery` — read the channel push setting.
  const {
    data,
    isLoading: isSettingsLoading,
    refetch,
  } = useQuery({
    queryKey: [CHANNEL_PUSH_NOTIFICATION_QUERY_KEY, channelId],
    queryFn: () => Client.notifications().channel(channelId).getSettings(),
    enabled: !!channelId,
  });

  const persistedIsEnabled = data?.isEnabled ?? true;

  const { mutateAsync } = useMutation<
    void,
    Error,
    UpdateChannelPushNotificationPayload
  >({
    mutationFn: ({ channelId: id, isEnabled }) =>
      isEnabled
        ? Client.notifications().channel(id).enable()
        : Client.notifications().channel(id).disable(),
    onSuccess: (_, variables) => {
      refetch();
      showToast({
        message: variables.isEnabled ? unmuteSuccess : muteSuccess,
        type: 'success',
      });
    },
    onError: (_, variables) => {
      showToast({
        message: variables.isEnabled ? unmuteError : muteError,
        type: 'failed',
      });
    },
  });

  const isSilent =
    channel?.notificationMode === AmityChannelNotificationModeEnum.Silent;
  const isLoading = isChannelLoading || isSettingsLoading;

  const { control, handleSubmit } = useForm<NotificationPreferenceForm>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    values: {
      isEnabled: persistedIsEnabled,
    },
  });

  function handleClose() {
    navigation.goBack();
  }

  const handleSave = handleSubmit(
    async (values: NotificationPreferenceForm) => {
      await mutateAsync({ channelId, isEnabled: values.isEnabled });
    }
  );

  return {
    control,
    isLoading,
    isSilent,
    persistedIsEnabled,
    handleClose,
    handleSave,
  };
}
