// UserList — the searchable user list for the create-conversation flow.
// Ported from AmityUiKitWeb v4/chat/features/conversation/create/components/UserList.
//
// RN adaptations from web:
//   - Web's `useSearchUserByDisplayName` (react-query) + IntersectionObserver
//     sentinel → the local `useSearchUsers` live-collection hook + FlatList
//     `onEndReached`.
//   - Web reads the current user via `useSDK().currentUserId`; RN reads
//     `Client.getCurrentUser()`.
//   - Search gate matches web exactly: a 1–2 char (partial) query is suppressed
//     and shows the "start typing" prompt; an empty query still browses all.

// 1. React / RN imports
import { type ReactElement } from 'react';
import { FlatList } from 'react-native';

// 2. Third-party imports
import { Client } from '@amityco/ts-sdk-react-native';

// 3. Internal imports (relative)
import { EmptyState } from '../../../../../features/shared/components/EmptyState';
import { UserItem } from '../UserItem/UserItem';
import { useSearchUsers } from '../../hooks/useSearchUsers';
import { useStyles } from './styles';

// Local constants (mirror AmityUiKitWeb v4/chat/constants).
const LIST_PAGE_LIMIT = 20;
const LIST_SKELETON_ROW_COUNT = 9;
const SEARCH_MIN_QUERY_LENGTH = 3;

// 4. Types
type UserListProps = {
  searchText: string;
  onSelectUser: (user: Amity.InternalUser) => void;
};

// 5. Named function component
export function UserList({ searchText, onSelectUser }: UserListProps) {
  const { styles } = useStyles();
  const currentUserId = Client.getCurrentUser()?.userId;

  const trimmed = searchText.trim();
  const isPartialQuery =
    trimmed.length > 0 && trimmed.length < SEARCH_MIN_QUERY_LENGTH;

  const { users, loading, hasNextPage, loadMore } = useSearchUsers({
    displayName: searchText,
    limit: LIST_PAGE_LIMIT,
    enabled: !isPartialQuery,
  });

  const isLoadingFirstPage = loading && users.length === 0;

  if (isPartialQuery) {
    return <EmptyState variant="prompt" />;
  }

  const visibleUsers = users.filter((user) => user.userId !== currentUserId);

  if (visibleUsers.length === 0 && !loading) {
    return <EmptyState variant="no-results" />;
  }

  const footer: ReactElement | null =
    isLoadingFirstPage || loading ? (
      <>
        {Array.from({ length: LIST_SKELETON_ROW_COUNT }).map((_, i) => (
          <UserItem.Skeleton key={i} />
        ))}
      </>
    ) : null;

  return (
    <FlatList
      style={styles.userList}
      data={visibleUsers}
      keyExtractor={(user) => user.userId}
      renderItem={({ item }) => <UserItem user={item} onPress={onSelectUser} />}
      onEndReachedThreshold={0.7}
      onEndReached={() => {
        if (hasNextPage && !isLoadingFirstPage && !loading) loadMore();
      }}
      ListFooterComponent={footer}
    />
  );
}
