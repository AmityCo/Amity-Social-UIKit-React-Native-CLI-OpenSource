// useSelectGroupMember — state + actions for the select-group-member step.
// Ported from AmityUiKitWeb v4/chat/features/group/select-member/hooks/
// useSelectGroupMember, keeping the react-hook-form + zod shape 1:1 so the
// SelectGroupMember screen consumes it via <Controller> unchanged.
//
// RN adaptations from web:
//   - Web debounces the search text with `react-use`'s `useDebounce`
//     (not installed in RN); replaced by the plain setTimeout effect the
//     conversation/create flow uses (SEARCH_DEBOUNCE_MS).
//   - Web navigates via the in-app ChatNavigationProvider (`pop`/`replace`);
//     RN uses React Navigation. `handleNext` uses `replace` so the back button
//     skips this step (parity with web `replace`). The destination route
//     (AmityCreateGroupChatPage) registers in a later wave — the typed
//     RootStackParamList does not know it yet, so the nav call is cast.
//   - Web's `useConfirmContext().info` member-limit dialog → RN `Alert.alert`.

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useString } from '../../../../../../../core/localization';
import type { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';
import { MEMBER_MAX_COUNT } from '../constants';

// Web reads SEARCH_DEBOUNCE_MS from chat/constants; inlined here to match the
// conversation/create flow and keep the port self-contained.
const SEARCH_DEBOUNCE_MS = 300;

// Route name for the create-group step. Web pushed a ChatPageTypes descriptor;
// RN targets a React Navigation route that registers in a later wave.
const CREATE_GROUP_CHAT_ROUTE = 'AmityCreateGroupChatPage';

// Web imported this type from ~/v4/chat/pages/SelectGroupMemberPage (a page that
// does not exist in RN); defined locally instead.
export type SelectGroupMemberPageProps = {
  selectedGroupMember?: Amity.User[];
};

const schema = z.object({
  searchText: z.string(),
  selectedUsers: z.array(z.custom<Amity.User>()).min(1).max(MEMBER_MAX_COUNT),
});

type SelectGroupMemberForm = z.infer<typeof schema>;

export function useSelectGroupMember({
  selectedGroupMember = [],
}: SelectGroupMemberPageProps = {}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const memberLimitTitle = useString('amity_chat_member_limit_reached_title');
  const memberLimitMessage = useString(
    'amity_chat_member_limit_reached_message'
  );
  const [debouncedText, setDebouncedText] = useState('');

  const form = useForm<SelectGroupMemberForm>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      searchText: '',
      selectedUsers: selectedGroupMember,
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

  function removeUser(userId: string) {
    const current = form.getValues('selectedUsers');
    form.setValue(
      'selectedUsers',
      current.filter((u) => u.userId !== userId),
      { shouldValidate: true, shouldDirty: true }
    );
  }

  function setSelectedUsers(users: Amity.User[]) {
    if (users.length > MEMBER_MAX_COUNT) {
      Alert.alert(memberLimitTitle, memberLimitMessage);
      return;
    }
    form.setValue('selectedUsers', users, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function handleClose() {
    navigation.goBack();
  }

  const handleNext = form.handleSubmit((values) => {
    (navigation.replace as unknown as (name: string, params?: object) => void)(
      CREATE_GROUP_CHAT_ROUTE,
      { selectedUsers: values.selectedUsers }
    );
  });

  return {
    form,
    searchText,
    setSearchText,
    debouncedText,
    selectedUsers,
    setSelectedUsers,
    removeUser,
    isFormValid: form.formState.isValid || form.formState.isSubmitting,
    handleClose,
    handleNext,
  };
}
