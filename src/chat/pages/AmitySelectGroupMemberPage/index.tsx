// AmitySelectGroupMemberPage — pick members for a new group (step 1 of create).
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { SelectGroupMember } from '../../features/group/select-member';

export type AmitySelectGroupMemberPageProps = NonNullable<
  RootStackParamList['AmitySelectGroupMemberPage']
>;

export default function AmitySelectGroupMemberPage(
  props: Partial<AmitySelectGroupMemberPageProps>
) {
  // Web reads the same value off `currentPage.context?.selectedGroupMember` in
  // Application.tsx and hands it to SelectGroupMember. RN's route params are the
  // equivalent carrier: `useCreateGroupChat.handleAddMember` already navigates
  // here with the members chosen so far, and dropping them meant the picker
  // reopened empty and its submit then REPLACED the create screen's list with
  // only the newly ticked users.
  const params = usePageParams<'AmitySelectGroupMemberPage'>(props);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <SelectGroupMember selectedGroupMember={params?.selectedGroupMember} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}

AmitySelectGroupMemberPage.displayName = 'AmitySelectGroupMemberPage';
