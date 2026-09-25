// AmityCreateGroupChatPage — name/avatar/privacy for a new group (step 2 of create).
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { CreateGroupChat } from '../../features/group/create';

export type AmityCreateGroupChatPageProps =
  RootStackParamList['AmityCreateGroupChatPage'];

export default function AmityCreateGroupChatPage(
  props: Partial<AmityCreateGroupChatPageProps>
) {
  const params = usePageParams<'AmityCreateGroupChatPage'>(props);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <CreateGroupChat selectedUsers={params.selectedUsers} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}

AmityCreateGroupChatPage.displayName = 'AmityCreateGroupChatPage';
