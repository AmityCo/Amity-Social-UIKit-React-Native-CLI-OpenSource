// AmityGroupNotificationPreferencePage — the "allow notifications" toggle screen.
// Ported from AmityUiKitWeb v4/chat/pages/GroupNotificationPreferencePage.
//
// RN adaptation: the route is not yet registered in RouteParamList (the
// orchestrator wires it), so the channelId param is typed locally to keep this
// file compiling independently.
import { SafeAreaView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { NotificationPreference } from '../../features/group/notification-preference';

type ParamList = {
  AmityGroupNotificationPreferencePage: { channelId: string };
};

export default function AmityGroupNotificationPreferencePage() {
  const { params } =
    useRoute<RouteProp<ParamList, 'AmityGroupNotificationPreferencePage'>>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NotificationPreference channelId={params.channelId} />
    </SafeAreaView>
  );
}
