// AmityArchivedChatPage — the navigation-destination wrapper for the archived
// chats feature, ported from AmityUiKitWeb v4/chat/pages/ArchivedChatPage.
// Mounts ArchivedChat inside a SafeAreaView (the feature owns its own Header +
// back navigation via useChatNavigation).
//
// RN adaptations from web:
//   - Web's `useAmityPage`/`themeStyles` wrapper → a plain themed SafeAreaView
//     (matches AmityChatHomePage).

// 1. React / RN imports
import { SafeAreaView } from 'react-native-safe-area-context';

// 2. Internal imports (relative)
import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import { ArchivedChat } from '../../features/archive';
import { useStyles } from './styles';

// 3. Named function component
export default function AmityArchivedChatPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ChatKeyboardAvoidingView>
        <ArchivedChat />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
