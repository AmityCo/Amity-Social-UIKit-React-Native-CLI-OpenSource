// AmityEditGroupNotificationPage — the notification-mode radio screen
// (default / silent / subscribe). Ported from AmityUiKitWeb
// v4/chat/pages/EditGroupNotificationPage.
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import { EditGroupNotification } from '../../features/group/edit-notification';

export type AmityEditGroupNotificationPageProps =
  RootStackParamList['AmityEditGroupNotificationPage'];

export default function AmityEditGroupNotificationPage(
  props: Partial<AmityEditGroupNotificationPageProps>
) {
  const params = usePageParams<'AmityEditGroupNotificationPage'>(props);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <EditGroupNotification channelId={params.channelId} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}

AmityEditGroupNotificationPage.displayName = 'AmityEditGroupNotificationPage';
