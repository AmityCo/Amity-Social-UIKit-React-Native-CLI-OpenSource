// AmityChatPage — navigation destination for a conversation thread. Reads the
// channelId + display name from the route and renders the Chat container, wiring
// the header back button to navigation.goBack. Mirrors AmityUiKitWeb ChatPage.

// 1. React / RN imports
import { SafeAreaView } from 'react-native-safe-area-context';

// 2. Third-party imports
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { ChatSurface } from '../../hooks/useChatSurfaceHeight';
import { Chat } from '../../features/conversation';
import { useStyles } from './styles';

// 4. Named function component
export default function AmityChatPage() {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'AmityChatPage'>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Publishes the page's own height, so a sheet inside can size against the
          page rather than the device. It wraps the keyboard owner rather than
          sitting inside it: the owner gives up height while a keyboard is open,
          which is the one reading this measurement must not take. It adds no
          padding of its own, so the owner's frame still starts at the page's
          top — the invariant its own assertion checks. */}
      <ChatSurface>
        <ChatKeyboardAvoidingView>
          <Chat
            channelId={params.channelId}
            userDisplayName={params.userDisplayName}
            jumpToMessageId={params.jumpToMessageId}
            onBack={() => navigation.goBack()}
          />
        </ChatKeyboardAvoidingView>
      </ChatSurface>
    </SafeAreaView>
  );
}
