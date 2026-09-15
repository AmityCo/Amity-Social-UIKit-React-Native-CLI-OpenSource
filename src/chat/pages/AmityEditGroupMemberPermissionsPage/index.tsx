// AmityEditGroupMemberPermissionsPage — who can send messages (everyone / moderators).
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { EditGroupMemberPermissions } from '../../features/group/edit-permission';

export default function AmityEditGroupMemberPermissionsPage() {
  const { params } =
    useRoute<
      RouteProp<RootStackParamList, 'AmityEditGroupMemberPermissionsPage'>
    >();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <EditGroupMemberPermissions channelId={params.channelId} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
