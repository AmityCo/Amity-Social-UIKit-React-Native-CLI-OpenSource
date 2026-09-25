// AmityGroupSettingPage — group settings (members, edit profile, permissions, leave).
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { GroupSetting } from '../../features/group/setting';

export type AmityGroupSettingPageProps =
  RootStackParamList['AmityGroupSettingPage'];

export default function AmityGroupSettingPage(
  props: Partial<AmityGroupSettingPageProps>
) {
  const params = usePageParams<'AmityGroupSettingPage'>(props);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <GroupSetting channelId={params.channelId} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}

AmityGroupSettingPage.displayName = 'AmityGroupSettingPage';
