// AmityEditGroupMemberPermissionsPage — who can send messages (everyone / moderators).
import { SafeAreaView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { EditGroupMemberPermissions } from '../../features/group/edit-permission';

export default function AmityEditGroupMemberPermissionsPage() {
  const { params } =
    useRoute<
      RouteProp<RootStackParamList, 'AmityEditGroupMemberPermissionsPage'>
    >();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EditGroupMemberPermissions channelId={params.channelId} />
    </SafeAreaView>
  );
}
