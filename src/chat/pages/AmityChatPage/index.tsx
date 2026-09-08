// AmityChatPage — navigation destination for a conversation thread. Reads the
// channelId + display name from the route and renders the Chat container, wiring
// the header back button to navigation.goBack. Mirrors AmityUiKitWeb ChatPage.

// 2. Third-party imports
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

// 3. Internal imports (relative)
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { Chat } from '../../features/conversation';
import { useStyles } from './styles';

// 4. Named function component
export default function AmityChatPage() {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'AmityChatPage'>>();

  return (
    <SafeAreaView style={styles.container}>
      <Chat
        channelId={params.channelId}
        userDisplayName={params.userDisplayName}
        onBack={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}
