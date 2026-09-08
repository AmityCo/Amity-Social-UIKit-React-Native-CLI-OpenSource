// AmityGroupChatPage — navigation destination for a group (community) conversation.
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { GroupChat } from '../../features/group/chat';
import { useStyles } from './styles';

export default function AmityGroupChatPage() {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityGroupChatPage'>>();

  return (
    // PDT-4910 (iOS only): see AmityChatPage — KeyboardAvoidingView has to be
    // the root of the screen for its padding math to line up with the keyboard's
    // absolute screen coordinates.
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        <GroupChat
          channelId={params.channelId}
          isJustCreated={params.isJustCreated}
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
