// ChatHome — ported from AmityUiKitWeb v4/chat/features/home/ChatHome.
// Composes the Header, the tab bar (All / Direct / Groups) and the active
// ChannelList for the selected tab's channel types.
//
// RN adaptations from web:
//   - `useChatFeatureFlags` gating is dropped for M1: a static three-tab config
//     is used (All + Direct + Groups).
//   - The notification banner is gated off on web too, so it is not mounted here.

// 1. React / RN imports
import { useMemo, useState } from 'react';
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Tabs } from '../../../../../core/design/molecules/Tabs';
import { useString } from '../../../../../core/localization';
import { Header } from './components/Header';
import { ChannelList } from './components/ChannelList';
import { useStyles } from './styles';

// 3. Types
export type ChatHomeProps = {
  /** Called with the pressed channel id — the page wires navigation. */
  onChannelPress?: (channelId: string) => void;
  /** Called when the empty-state create button is pressed. */
  onCreatePress?: () => void;
};

const TAB_TYPES: Record<string, Amity.ChannelType[]> = {
  all: ['conversation', 'community'],
  direct: ['conversation'],
  group: ['community'],
};

// 4. Named function component
export function ChatHome({ onChannelPress, onCreatePress }: ChatHomeProps) {
  const { styles } = useStyles();

  const allLabel = useString('amity_chat_tab_all');
  const directLabel = useString('amity_chat_tab_direct');
  const groupsLabel = useString('amity_chat_tab_groups');

  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = useMemo(
    () => [
      { value: 'all', label: allLabel },
      { value: 'direct', label: directLabel },
      { value: 'group', label: groupsLabel },
    ],
    [allLabel, directLabel, groupsLabel]
  );

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.tabsWrapper}>
        <Tabs
          variant="pill"
          value={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
        />
      </View>
      <View style={styles.listWrapper}>
        <ChannelList
          types={TAB_TYPES[activeTab]}
          onChannelPress={onChannelPress}
          onCreatePress={onCreatePress}
        />
      </View>
    </View>
  );
}
