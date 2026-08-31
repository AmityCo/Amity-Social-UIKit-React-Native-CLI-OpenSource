// MemberTabs — ported from AmityUiKitWeb
// v4/chat/features/group/members/components/MemberTabs.
//
// Members / Moderators tabs, each with a search bar over a MemberList. Web's
// react-aria Tabs rendered the panel content itself; the RN Tabs molecule is the
// bar only, so this composes the bar + the active panel manually. Web debounced
// via react-use `useDebounce`; RN uses a plain setTimeout effect (react-use is
// not a dependency here), matching useCreateConversation.

// 1. React / RN imports
import { useEffect, useState } from 'react';
import { View } from 'react-native';

// 2. Internal imports
import { Tabs } from '../../../../../../core/design/molecules/Tabs';
import { SearchInput } from '../../../../../../core/design/molecules/SearchInput';
import { useString } from '../../../../../../core/localization';
import { MemberList } from '../MemberList';
import { useStyles } from './styles';

const SEARCH_DEBOUNCE_MS = 300;

export enum MembershipsTab {
  Members = 'members',
  Moderators = 'moderators',
}

// 3. Types
type MemberTabsProps = {
  channelId: string;
};

// 4. Named function component
export function MemberTabs({ channelId }: MemberTabsProps) {
  const { styles } = useStyles();
  const [activeTab, setActiveTab] = useState<string>(MembershipsTab.Members);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const searchPlaceholder = useString('amity_chat_search_placeholder');
  const membersTabLabel = useString('amity_chat_member_tab_members');
  const moderatorsTabLabel = useString('amity_chat_member_tab_moderators');

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(searchText),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [searchText]);

  function handleTabChange(value: string) {
    setActiveTab(value);
    setSearchText('');
    setDebouncedSearch('');
  }

  const onlyModerators = activeTab === MembershipsTab.Moderators;

  return (
    <View style={styles.container}>
      <Tabs
        variant="underlined"
        value={activeTab}
        onChange={handleTabChange}
        tabs={[
          { value: MembershipsTab.Members, label: membersTabLabel },
          { value: MembershipsTab.Moderators, label: moderatorsTabLabel },
        ]}
      />
      <View style={styles.searchBar}>
        <SearchInput
          value={searchText}
          onChange={setSearchText}
          placeholder={searchPlaceholder}
          accessibilityLabel={searchPlaceholder}
        />
      </View>
      <MemberList
        channelId={channelId}
        search={debouncedSearch}
        onlyModerators={onlyModerators}
      />
    </View>
  );
}
