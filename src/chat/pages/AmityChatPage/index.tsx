// AmityChatPage — navigation destination for a conversation thread. Reads the
// channelId + display name from the route and renders the Chat container, wiring
// the header back button to navigation.goBack. Mirrors AmityUiKitWeb ChatPage.

// 1. React / RN imports
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';

// 2. Third-party imports
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
    // PDT-4910 (iOS only): KeyboardAvoidingView must be the ROOT of the screen.
    // Its 'padding' math is `frame.y + frame.height - keyboardScreenY`, where
    // `frame` comes from onLayout (PARENT-relative) while the keyboard Y is an
    // absolute SCREEN coordinate. Nested inside SafeAreaView it therefore
    // under-shot by the safe-area insets and left the composer behind the
    // keyboard. At the root the two coordinate spaces agree. Android is
    // unaffected: `behavior` is undefined there (native adjustResize handles it)
    // and RN's SafeAreaView is a plain View on Android.
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        <Chat
          channelId={params.channelId}
          userDisplayName={params.userDisplayName}
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
