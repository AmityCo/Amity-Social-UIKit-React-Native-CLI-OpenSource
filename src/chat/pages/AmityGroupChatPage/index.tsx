// AmityGroupChatPage — navigation destination for a group (community) conversation.
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { GroupChat } from '../../features/group/chat';
import { ChatSurface } from '../../hooks/useChatSurfaceHeight';

export type AmityGroupChatPageProps = RootStackParamList['AmityGroupChatPage'];

export default function AmityGroupChatPage(
  props: Partial<AmityGroupChatPageProps>
) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = usePageParams<'AmityGroupChatPage'>(props);

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
            jumpToMessageId={params.jumpToMessageId}
            onBack={() => navigation.goBack()}
          />
        </ChatKeyboardAvoidingView>
      </ChatSurface>
    </SafeAreaView>
  );
}

AmityGroupChatPage.displayName = 'AmityGroupChatPage';
