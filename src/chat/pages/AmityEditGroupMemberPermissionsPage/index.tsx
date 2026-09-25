// AmityEditGroupMemberPermissionsPage — who can send messages (everyone / moderators).
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { EditGroupMemberPermissions } from '../../features/group/edit-permission';

export type AmityEditGroupMemberPermissionsPageProps =
  RootStackParamList['AmityEditGroupMemberPermissionsPage'];

export default function AmityEditGroupMemberPermissionsPage(
  props: Partial<AmityEditGroupMemberPermissionsPageProps>
) {
  const params = usePageParams<'AmityEditGroupMemberPermissionsPage'>(props);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <EditGroupMemberPermissions channelId={params.channelId} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}

AmityEditGroupMemberPermissionsPage.displayName =
  'AmityEditGroupMemberPermissionsPage';
