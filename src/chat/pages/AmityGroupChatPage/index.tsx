// AmityGroupChatPage — navigation destination for a group (community) conversation.
// SafeAreaView from react-native-safe-area-context (not react-native): the core
// one is iOS-only, so under Android's mandatory edge-to-edge the system
// navigation bar painted over the message composer (PDT-5184).
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../core/routes/RouteParamList';
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
