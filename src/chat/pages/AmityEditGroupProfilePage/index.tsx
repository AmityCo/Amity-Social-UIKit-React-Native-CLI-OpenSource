// AmityEditGroupProfilePage — edit group name + avatar.
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { EditGroupProfile } from '../../features/group/edit-profile';

export default function AmityEditGroupProfilePage() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityEditGroupProfilePage'>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <EditGroupProfile channelId={params.channelId} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
