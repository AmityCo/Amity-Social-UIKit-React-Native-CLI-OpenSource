// AmityGroupChatPage — navigation destination for a group (community) conversation.
import { SafeAreaView } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { GroupChat } from '../../features/group/chat';

export default function AmityGroupChatPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityGroupChatPage'>>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GroupChat
        channelId={params.channelId}
        isJustCreated={params.isJustCreated}
        onBack={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}
