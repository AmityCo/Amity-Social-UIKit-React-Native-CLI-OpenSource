// AmityCreateGroupChatPage — name/avatar/privacy for a new group (step 2 of create).
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { CreateGroupChat } from '../../features/group/create';

export default function AmityCreateGroupChatPage() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityCreateGroupChatPage'>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <CreateGroupChat selectedUsers={params.selectedUsers} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
