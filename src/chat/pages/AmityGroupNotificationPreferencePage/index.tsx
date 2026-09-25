// AmityGroupNotificationPreferencePage — the "allow notifications" toggle screen.
// Ported from AmityUiKitWeb v4/chat/pages/GroupNotificationPreferencePage.
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import { NotificationPreference } from '../../features/group/notification-preference';

export type AmityGroupNotificationPreferencePageProps =
  RootStackParamList['AmityGroupNotificationPreferencePage'];

export default function AmityGroupNotificationPreferencePage(
  props: Partial<AmityGroupNotificationPreferencePageProps>
) {
  const params = usePageParams<'AmityGroupNotificationPreferencePage'>(props);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <NotificationPreference channelId={params.channelId} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}

AmityGroupNotificationPreferencePage.displayName =
  'AmityGroupNotificationPreferencePage';
