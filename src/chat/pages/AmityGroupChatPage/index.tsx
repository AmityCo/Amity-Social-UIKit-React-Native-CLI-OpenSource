// AmityGroupChatPage — navigation destination for a group (community) conversation.
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { GroupChat } from '../../features/group/chat';
import { ChatSurface } from '../../hooks/useChatSurfaceHeight';

export default function AmityGroupChatPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityGroupChatPage'>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      {/* Publishes the page's own height for a sheet inside to size against —
          outside the keyboard owner, which gives up height while a keyboard is
          open. See useChatSurfaceHeight. */}
      <ChatSurface>
        <ChatKeyboardAvoidingView>
          <GroupChat
            channelId={params.channelId}
            isJustCreated={params.isJustCreated}
            onBack={() => navigation.goBack()}
          />
        </ChatKeyboardAvoidingView>
      </ChatSurface>
    </SafeAreaView>
  );
}
