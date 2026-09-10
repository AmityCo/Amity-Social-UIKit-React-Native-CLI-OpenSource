// useAddGroupMember — ported from AmityUiKitWeb
// v4/chat/features/group/add-member/hooks/useAddGroupMember.
//
// Keeps web's react-hook-form + zod form (both are dependencies here). Web
// debounced the search with react-use; RN uses a setTimeout effect (react-use is
// not a dependency). Web navigated + toasted via the ChatNavigationProvider and
// NotificationProvider; RN uses `useChatNavigation().pop` (or an `onClose`
// callback) and the `useChatNotifications` stub. `addMembers` is the positional
// SDK call, gated on `useAuth().isConnected`.

import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
import { resolveString } from '../../../../../core/localization';
import useAuth from '../../../../../core/hooks/useAuth';
import { useChatNavigation } from '../../../../hooks/useChatNavigation';
import { useChatNotifications } from '../../../../hooks/useChatNotifications';

const SEARCH_DEBOUNCE_MS = 300;

const schema = z.object({
  searchText: z.string(),
  selectedUsers: z.array(z.custom<Amity.InternalUser>()).min(1),
});

type AddGroupMemberForm = z.infer<typeof schema>;

export type UseAddGroupMemberParams = {
  channelId: string;
  onClose?: () => void;
};

export function useAddGroupMember({
  channelId,
  onClose,
}: UseAddGroupMemberParams) {
  const { pop } = useChatNavigation();
  const { isConnected } = useAuth();
  const { success } = useChatNotifications();
  const [debouncedText, setDebouncedText] = useState('');

  const form = useForm<AddGroupMemberForm>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      searchText: '',
      selectedUsers: [],
    },
  });

  const searchText = form.watch('searchText');
  const selectedUsers = form.watch('selectedUsers');

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedText(searchText),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  function setSearchText(value: string) {
    form.setValue('searchText', value, { shouldValidate: true });
  }

  function setSelectedUsers(users: Amity.InternalUser[]) {
    form.setValue('selectedUsers', users, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function removeUser(userId: string) {
    const current = form.getValues('selectedUsers');
    form.setValue(
      'selectedUsers',
      current.filter((u) => u.userId !== userId),
      { shouldValidate: true, shouldDirty: true }
    );
  }

  const handleClose = onClose ?? pop;

  const handleAddMember = form.handleSubmit(async (values) => {
    if (!isConnected) return;
    const userIds = values.selectedUsers.map((u) => u.userId);
    await ChannelRepository.Membership.addMembers(channelId, userIds);
    handleClose();
    success({
      content: resolveString(
        userIds.length > 1
          ? 'amity_chat_toast_members_added'
          : 'amity_chat_toast_member_added'
      ),
    });
  });

  return {
    form,
    searchText,
    debouncedText,
    selectedUsers,
    setSearchText,
    setSelectedUsers,
    removeUser,
    handleClose,
    handleAddMember,
    isFormValid: form.formState.isValid || form.formState.isSubmitting,
  };
}
