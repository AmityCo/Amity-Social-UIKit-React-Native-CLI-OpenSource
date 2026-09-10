// AmityChatHomePage — the navigation-destination wrapper for the chat home
// (channel list). It mounts ChatHome inside a SafeAreaView and wires row presses
// to React Navigation. The target `AmityChatPage` route is not registered yet;
// AmityChatPage is registered in the navigator (M2); pressing a row opens the thread.

// 1. React / RN imports
import { SafeAreaView } from 'react-native-safe-area-context';

// 2. Third-party imports
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import { ChatHome } from '../../features/home';
import { useStyles } from './styles';

// 4. Named function component
export default function AmityChatHomePage() {
  const { styles } = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ChatKeyboardAvoidingView>
        <ChatHome
          onChannelPress={(channelId, displayName, type) =>
            type === 'community'
              ? navigation.navigate('AmityGroupChatPage', { channelId })
              : navigation.navigate('AmityChatPage', {
                  channelId,
                  userDisplayName: displayName,
                })
          }
          onCreatePress={() =>
            navigation.navigate('AmityChannelCreateConversationPage')
          }
        />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
