// AmityAddGroupMemberPage — add members to an existing group.
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { AddGroupMember } from '../../features/group/add-member';

export type AmityAddGroupMemberPageProps =
  RootStackParamList['AmityAddGroupMemberPage'];

export default function AmityAddGroupMemberPage(
  props: Partial<AmityAddGroupMemberPageProps>
) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = usePageParams<'AmityAddGroupMemberPage'>(props);

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

AmityAddGroupMemberPage.displayName = 'AmityAddGroupMemberPage';
