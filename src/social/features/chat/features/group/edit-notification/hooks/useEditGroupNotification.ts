// useEditGroupNotification — RN port of AmityUiKitWeb
// v4/chat/features/group/edit-notification/hooks/useEditGroupNotification.
// Owns the notification-mode radio form (default / silent / subscribe), seeded
// from the channel's persisted `notificationMode`, and the save mutation.
//
// RN adaptations from web:
//   - Web `useChannelObject` → an inline `ChannelRepository.getChannel` live
//     subscription gated on `useAuth().isConnected` (the sibling edit-permission
//     port's pattern).
//   - Web `useUpdateChannelQuery` (a `chat/hooks/queries` layer with no tracked RN
//     counterpart) → an inline `@tanstack/react-query` mutation over
//     `ChannelRepository.updateChannel(channelId, { notificationMode })` — the
//     exact SDK call web makes.
//   - react-hook-form + zod are kept 1:1 with web.
//   - Web `useChatNavigation().pop()` → React Navigation `goBack`.
//   - Web `useNotifications('chat').success` / query error toast → the redux toast
//     (`useToast`).

// 1. React / RN imports
import { useEffect, useState } from 'react';

// 2. Third-party imports
import {
  ChannelRepository,
  AmityChannelNotificationModeEnum,
} from '@amityco/ts-sdk-react-native';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import useAuth from '../../../../../../../core/hooks/useAuth';
import { useString } from '../../../../../../../core/localization';
import { useToast } from '../../../../../../../core/stores/slices/toastSlice';

const schema = z.object({
  notificationMode: z.nativeEnum(AmityChannelNotificationModeEnum),
});

type EditGroupNotificationForm = z.infer<typeof schema>;

// 4. Types
export type EditGroupNotificationProps = {
  channelId: string;
};

type UpdateChannelPayload = {
  channelId: string;
  notificationMode: AmityChannelNotificationModeEnum;
};

// 5. Hook
export function useEditGroupNotification({
  channelId,
}: EditGroupNotificationProps) {
  const { isConnected } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const errorToast = useString('amity_chat_group_notification_save_error');
  const successToast = useString('amity_chat_group_notification_save_success');

  // Web `useChannelObject` → inline live channel subscription.
  const [channel, setChannel] = useState<Amity.Channel | undefined>(undefined);

  useEffect(() => {
    if (!isConnected || !channelId) return undefined;
    const unsub = ChannelRepository.getChannel(channelId, ({ data }) => {
      if (data) setChannel(data);
    });
    return () => {
      unsub();
    };
  }, [isConnected, channelId]);

  // Web `useUpdateChannelQuery`.
  const { mutateAsync } = useMutation<
    Amity.Cached<Amity.InternalChannel>,
    Error,
    UpdateChannelPayload
  >({
    mutationFn: ({ channelId: id, notificationMode }) =>
      ChannelRepository.updateChannel(id, { notificationMode }),
    onError: () => {
      showToast({ message: errorToast, type: 'failed' });
    },
  });

  const initialMode =
    channel?.notificationMode ?? AmityChannelNotificationModeEnum.Default;

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, isValid },
  } = useForm<EditGroupNotificationForm>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    values: {
      notificationMode: initialMode,
    },
  });

  function handleClose() {
    navigation.goBack();
  }

  const handleSave = handleSubmit(async (values: EditGroupNotificationForm) => {
    await mutateAsync({
      channelId,
      notificationMode: values.notificationMode,
    });
    showToast({ message: successToast, type: 'success' });
    navigation.goBack();
  });

  return {
    control,
    channel,
    handleClose,
    handleSave,
    isFormValid: !isSubmitting && isDirty && isValid,
  };
}
