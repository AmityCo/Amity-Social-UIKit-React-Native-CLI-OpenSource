// AmityArchivedChatPage — the navigation-destination wrapper for the archived
// chats feature, ported from AmityUiKitWeb v4/chat/pages/ArchivedChatPage.
// Mounts ArchivedChat inside a SafeAreaView (the feature owns its own Header +
// back navigation via useChatNavigation).
//
// RN adaptations from web:
//   - Web's `useAmityPage`/`themeStyles` wrapper → a plain themed SafeAreaView
//     (matches AmityChatHomePage).

// 1. React / RN imports
import { SafeAreaView } from 'react-native';

// 2. Internal imports (relative)
import { ArchivedChat } from '../../features/archive';
import { useStyles } from './styles';

// 3. Named function component
export default function AmityArchivedChatPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <ArchivedChat />
    </SafeAreaView>
  );
}
