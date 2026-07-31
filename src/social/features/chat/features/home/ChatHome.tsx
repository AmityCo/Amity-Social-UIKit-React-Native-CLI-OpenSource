// ChatHome — ported from AmityUiKitWeb v4/chat/features/home/ChatHome.
// Composes the Header, the tab bar (All / Direct / Groups) and the active
// ChannelList for the selected tab's channel types.
//
// RN adaptations from web:
//   - `useChatFeatureFlags` gating is dropped for M1: a static three-tab config
//     is used (All + Direct + Groups).
//   - Web has no notification features, so the "Push notifications have been
//     disabled by admin" banner is ported from AmityUIKitIOS (release/4.25.0):
//     usePushNotificationEnabled fetches the network/chat-module push setting and
//     ChannelList renders the banner above the list when it's disabled.

// 1. React / RN imports
import { useMemo, useState } from 'react';
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Tabs } from '../../../../../core/design/molecules/Tabs';
import { useString } from '../../../../../core/localization';
import { Header } from './components/Header';
import { ChannelList } from './components/ChannelList';
import { usePushNotificationEnabled } from './hooks';
import { useStyles } from './styles';

// 3. Types
export type ChatHomeProps = {
  /** Called with the pressed channel id + display name + type — the page wires navigation. */
  onChannelPress?: (
    channelId: string,
    displayName?: string,
    type?: Amity.ChannelType
  ) => void;
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
  const isPushNotificationEnabled = usePushNotificationEnabled();

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
          isPushNotificationEnabled={isPushNotificationEnabled}
          onChannelPress={onChannelPress}
          onCreatePress={onCreatePress}
        />
      </View>
    </View>
  );
}
