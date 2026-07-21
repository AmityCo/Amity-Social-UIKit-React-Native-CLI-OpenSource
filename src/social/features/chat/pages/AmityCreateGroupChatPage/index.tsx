// AmityCreateGroupChatPage — name/avatar/privacy for a new group (step 2 of create).
import { SafeAreaView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { CreateGroupChat } from '../../features/group/create';

export default function AmityCreateGroupChatPage() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityCreateGroupChatPage'>>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CreateGroupChat selectedUsers={params.selectedUsers} />
    </SafeAreaView>
  );
}
