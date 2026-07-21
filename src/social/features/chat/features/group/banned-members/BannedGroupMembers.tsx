// BannedGroupMembers — ported from AmityUiKitWeb v4/chat/features/group/banned-members.
// Feature entry: a back Header, a search bar, and the banned-member list.
// `channelId` mirrors web's page prop; `onBack` is an optional navigation
// callback supplied by the hosting page.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Header } from './components/Header';
import { BannedMemberList } from './components/BannedMemberList';
import { useBannedGroupMembers } from './hooks/useBannedGroupMembers';
import { SearchInput } from '../../../../../../core/design/molecules/SearchInput';
import { useString } from '../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
export type BannedGroupMembersProps = {
  channelId: string;
  onBack?: () => void;
};

// 4. Named function component
export function BannedGroupMembers({
  channelId,
  onBack,
}: BannedGroupMembersProps) {
  const { styles } = useStyles();
  const {
    searchText,
    setSearchText,
    debouncedSearch,
    handleBack,
    handleUnban,
  } = useBannedGroupMembers({ channelId, onBack });
  const searchPlaceholder = useString('amity_chat_search_placeholder');

  return (
    <View style={styles.bannedGroupMembers}>
      <Header onBack={handleBack} />
      <View style={styles.searchBar}>
        <SearchInput
          value={searchText}
          onChange={setSearchText}
          placeholder={searchPlaceholder}
          accessibilityLabel={searchPlaceholder}
        />
      </View>
      <BannedMemberList
        channelId={channelId}
        search={debouncedSearch}
        onUnban={handleUnban}
      />
    </View>
  );
}
