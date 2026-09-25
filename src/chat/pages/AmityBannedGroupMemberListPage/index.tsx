// AmityBannedGroupMemberListPage — banned members list (unban).
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { BannedGroupMembers } from '../../features/group/banned-members';

export default function AmityBannedGroupMemberListPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityBannedGroupMemberListPage'>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <BannedGroupMembers
          channelId={params.channelId}
          onBack={() => navigation.goBack()}
        />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
