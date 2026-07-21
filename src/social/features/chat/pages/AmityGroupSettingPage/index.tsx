// AmityGroupSettingPage — group settings (members, edit profile, permissions, leave).
import { SafeAreaView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { GroupSetting } from '../../features/group/setting';

export default function AmityGroupSettingPage() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityGroupSettingPage'>>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GroupSetting channelId={params.channelId} />
    </SafeAreaView>
  );
}
