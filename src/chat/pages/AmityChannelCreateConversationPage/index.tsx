// AmityChannelCreateConversationPage — navigation destination that hosts the
// create-conversation flow. Mirrors AmityUiKitWeb ChannelCreateConversationPage
// and the sibling AmityChatPage wrapper pattern (SafeAreaView + feature entry).

// 1. React / RN imports
import { SafeAreaView } from 'react-native-safe-area-context';

// 2. Internal imports (relative)
import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import { CreateConversation } from '../../features/conversation/create';
import { useStyles } from './styles';

// 3. Named function component
export default function AmityChannelCreateConversationPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ChatKeyboardAvoidingView>
        <CreateConversation />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
