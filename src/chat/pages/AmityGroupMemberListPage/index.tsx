// AmityGroupMemberListPage — group members list (member/moderator tabs).
import { SafeAreaView } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { GroupMembers } from '../../features/group/members';

export default function AmityGroupMemberListPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityGroupMemberListPage'>>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GroupMembers
        channelId={params.channelId}
        onBack={() => navigation.goBack()}
        onAddMember={() =>
          navigation.navigate('AmityAddGroupMemberPage', {
            channelId: params.channelId,
          })
        }
      />
    </SafeAreaView>
  );
}
