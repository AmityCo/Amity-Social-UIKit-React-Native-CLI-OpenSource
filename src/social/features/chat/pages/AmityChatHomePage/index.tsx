// AmityChatHomePage — the navigation-destination wrapper for the chat home
// (channel list). It mounts ChatHome inside a SafeAreaView and wires row presses
// to React Navigation. The target `AmityChatPage` route is not registered yet;
// wiring the call now is intentional (M1 renders the live list).

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
        onChannelPress={(channelId) =>
          navigation.navigate('AmityChatPage', { channelId })
        }
      />
    </SafeAreaView>
  );
}
