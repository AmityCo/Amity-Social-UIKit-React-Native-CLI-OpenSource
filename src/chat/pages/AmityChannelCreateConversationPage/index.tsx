// AmityChannelCreateConversationPage — navigation destination that hosts the
// create-conversation flow. Mirrors AmityUiKitWeb ChannelCreateConversationPage
// and the sibling AmityChatPage wrapper pattern (SafeAreaView + feature entry).

// 1. React / RN imports
import { SafeAreaView } from 'react-native';

// 2. Internal imports (relative)
import { CreateConversation } from '../../features/conversation/create';
import { useStyles } from './styles';

// 3. Named function component
export default function AmityChannelCreateConversationPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <CreateConversation />
    </SafeAreaView>
  );
}
