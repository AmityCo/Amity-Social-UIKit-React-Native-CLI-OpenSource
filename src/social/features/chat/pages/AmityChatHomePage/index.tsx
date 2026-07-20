// AmityChatHomePage — the navigation-destination wrapper for the chat home
// (channel list). It mounts ChatHome inside a SafeAreaView and wires row presses
// to React Navigation. The target `AmityChatPage` route is not registered yet;
// AmityChatPage is registered in the navigator (M2); pressing a row opens the thread.

// 1. React / RN imports
import { SafeAreaView } from 'react-native';

// 2. Third-party imports
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import { ChatHome } from '../../features/home';
import { useStyles } from './styles';

// 4. Named function component
export default function AmityChatHomePage() {
  const { styles } = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <SafeAreaView style={styles.container}>
      <ChatHome
        onChannelPress={(channelId, displayName) =>
          navigation.navigate('AmityChatPage', {
            channelId,
            userDisplayName: displayName,
          })
        }
      />
    </SafeAreaView>
  );
}
