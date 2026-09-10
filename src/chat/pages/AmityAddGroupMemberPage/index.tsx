// AmityAddGroupMemberPage — add members to an existing group.
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { AddGroupMember } from '../../features/group/add-member';

export default function AmityAddGroupMemberPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityAddGroupMemberPage'>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <AddGroupMember
          channelId={params.channelId}
          onClose={() => navigation.goBack()}
        />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
