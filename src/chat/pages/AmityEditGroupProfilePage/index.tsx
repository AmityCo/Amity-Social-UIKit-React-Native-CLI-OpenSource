// AmityEditGroupProfilePage — edit group name + avatar.
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatKeyboardAvoidingView } from '../../elements/ChatKeyboardAvoidingView';
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import { usePageParams } from '../../hooks/usePageParams';
import { EditGroupProfile } from '../../features/group/edit-profile';

export type AmityEditGroupProfilePageProps =
  RootStackParamList['AmityEditGroupProfilePage'];

export default function AmityEditGroupProfilePage(
  props: Partial<AmityEditGroupProfilePageProps>
) {
  const params = usePageParams<'AmityEditGroupProfilePage'>(props);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <ChatKeyboardAvoidingView>
        <EditGroupProfile channelId={params.channelId} />
      </ChatKeyboardAvoidingView>
    </SafeAreaView>
  );
}

AmityEditGroupProfilePage.displayName = 'AmityEditGroupProfilePage';
