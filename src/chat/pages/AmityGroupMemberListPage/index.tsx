// AmityGroupMemberListPage — group members list (member/moderator tabs).
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { GroupMembers } from '../../features/group/members';

export type AmityGroupMemberListPageProps =
  RootStackParamList['AmityGroupMemberListPage'];

export default function AmityGroupMemberListPage(
  props: Partial<AmityGroupMemberListPageProps>
) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = usePageParams<'AmityGroupMemberListPage'>(props);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <GroupMembers
          channelId={params.channelId}
          onBack={() => navigation.goBack()}
          onAddMember={() =>
            navigation.navigate('AmityAddGroupMemberPage', {
              channelId: params.channelId,
            })
          }
        />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}

AmityGroupMemberListPage.displayName = 'AmityGroupMemberListPage';
