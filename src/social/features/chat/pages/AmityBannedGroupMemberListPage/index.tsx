// AmityBannedGroupMemberListPage — banned members list (unban).
import { SafeAreaView } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { BannedGroupMembers } from '../../features/group/banned-members';

export default function AmityBannedGroupMemberListPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityBannedGroupMemberListPage'>>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BannedGroupMembers
        channelId={params.channelId}
        onBack={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}
