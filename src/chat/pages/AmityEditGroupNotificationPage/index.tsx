// AmityEditGroupNotificationPage — the notification-mode radio screen
// (default / silent / subscribe). Ported from AmityUiKitWeb
// v4/chat/pages/EditGroupNotificationPage.
//
// RN adaptation: the route is not yet registered in RouteParamList (the
// orchestrator wires it), so the channelId param is typed locally to keep this
// file compiling independently.
import { SafeAreaView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { EditGroupNotification } from '../../features/group/edit-notification';

type ParamList = {
  AmityEditGroupNotificationPage: { channelId: string };
};

export default function AmityEditGroupNotificationPage() {
  const { params } =
    useRoute<RouteProp<ParamList, 'AmityEditGroupNotificationPage'>>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EditGroupNotification channelId={params.channelId} />
    </SafeAreaView>
  );
}
