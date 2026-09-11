// AmityGroupSettingPage — group settings (members, edit profile, permissions, leave).
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { GroupSetting } from '../../features/group/setting';

export default function AmityGroupSettingPage() {
  const { params } =
    useRoute<RouteProp<RootStackParamList, 'AmityGroupSettingPage'>>();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <GroupSetting channelId={params.channelId} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}
