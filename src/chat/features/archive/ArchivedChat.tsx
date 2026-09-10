// ArchivedChat — ported from AmityUiKitWeb v4/chat/features/archive/ArchivedChat.
// The archived-chats feature root: a back-navigating Header over the
// ArchivedChannelList.
//
// RN adaptations from web:
//   - Web `useChatNavigation().pop` → the RN `useChatNavigation` adapter (goBack).
//   - `<div>` → View; `min-height: 100svh` → flex:1 (no svh in RN).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { useChatNavigation } from '../../hooks/useChatNavigation';
import { Header, ArchivedChannelList } from './components';
import { useStyles } from './styles';

// 3. Named function component
export function ArchivedChat() {
  const { styles } = useStyles();
  const { pop } = useChatNavigation();

  return (
    <View style={styles.archivedChat}>
      <Header onBack={pop} />
      <ArchivedChannelList />
    </View>
  );
}
