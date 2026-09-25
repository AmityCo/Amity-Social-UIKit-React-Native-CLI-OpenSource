// AmityBannedGroupMemberListPage — banned members list (unban).
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { BannedGroupMembers } from '../../features/group/banned-members';

export type AmityBannedGroupMemberListPageProps =
  RootStackParamList['AmityBannedGroupMemberListPage'];

export default function AmityBannedGroupMemberListPage(
  props: Partial<AmityBannedGroupMemberListPageProps>
) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = usePageParams<'AmityBannedGroupMemberListPage'>(props);

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

AmityBannedGroupMemberListPage.displayName = 'AmityBannedGroupMemberListPage';
