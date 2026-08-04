// SearchChannel — ported from AmityUiKitWeb v4/chat/features/search/SearchChannel.
// The chat-search feature root: a search Header over a Chats/Messages tab switch.
//
// RN adaptations from web:
//   - Web's Tabs molecule rendered the active panel itself (via each tab's
//     `content` render-prop). The RN Tabs molecule is the bar only, so this
//     composes the bar + the active panel manually (mirrors MemberTabs).
//   - Web's two result lists live at ~/chat/features/search/components; the RN port
//     places them at chat/components (AmitySearchChannelResults /
//     AmitySearchMessageResults per the parity manifest).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Tabs } from '../../../core/design/molecules/Tabs';
import { useString } from '../../../core/localization';
import { SEARCH_TAB } from '../../constants';
import { AmitySearchChannelResults } from '../../components/AmitySearchChannelResults';
import { AmitySearchMessageResults } from '../../components/AmitySearchMessageResults';
import { Header } from './components';
import { useSearchChannel } from './hooks';
import { useStyles } from './styles';

type SearchTabValue = (typeof SEARCH_TAB)[keyof typeof SEARCH_TAB];

// 3. Named function component
export function SearchChannel() {
  const { styles } = useStyles();
  const {
    searchText,
    setSearchText,
    debouncedQuery,
    clearSearch,
    cancel,
    activeTab,
    setActiveTab,
  } = useSearchChannel();
  const chatsTabLabel = useString('amity_chat_search_tab_chats');
  const messagesTabLabel = useString('amity_chat_search_tab_messages');

  return (
    <View style={styles.searchChannel}>
      <Header
        searchText={searchText}
        onSearchTextChange={setSearchText}
        onClear={clearSearch}
        onCancel={cancel}
      />
      <Tabs
        variant="underlined"
        value={activeTab}
        onChange={(value) => setActiveTab(value as SearchTabValue)}
        tabs={[
          { value: SEARCH_TAB.CHATS, label: chatsTabLabel },
          { value: SEARCH_TAB.MESSAGES, label: messagesTabLabel },
        ]}
      />
      <View style={styles.panel}>
        {activeTab === SEARCH_TAB.CHATS ? (
          <AmitySearchChannelResults query={debouncedQuery} />
        ) : (
          <AmitySearchMessageResults query={debouncedQuery} />
        )}
      </View>
    </View>
  );
}
