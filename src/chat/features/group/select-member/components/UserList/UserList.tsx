// UserList — the searchable, multi-select user list for the select-group-member
// step. Ported from AmityUiKitWeb v4/chat/features/group/select-member/components/
// UserList.
//
// RN adaptations from web:
//   - Web's core `useSearchUserByDisplayName` (react-query) + IntersectionObserver
//     sentinel → the conversation/create `useSearchUsers` live-collection hook
//     (reused, not rebuilt) + FlatList `onEndReached`.
//   - Web's `react-aria` `CheckboxGroup` has no RN equivalent; each row is an
//     individual `Selection.Checkbox`. Toggling merges into / removes from the
//     existing `selectedUsers` array so selections made under a previous search
//     query survive when the visible results change.
//   - Web's `.userList__row[data-hovered]` background becomes the row's PRESSED
//     background. `Selection.Checkbox` (a core atom) owns a full-width Pressable
//     whose style can't be extended, so an outer Pressable owns the toggle + the
//     pressed background and the inner checkbox is rendered visual-only
//     (`pointerEvents="none"`) — the transparent checkbox row lets the pressed
//     background show through.
//   - Web reads the current user via `useSDK().currentUserId`; RN reads
//     `Client.getCurrentUser()`.
//   - Search gate matches web exactly: a 1–2 char (partial) query is suppressed
//     and shows the prompt; an empty query still browses all users.

// 1. React / RN imports
import { type ReactElement } from 'react';
import { FlatList, Pressable, View } from 'react-native';

// 2. Third-party imports
import { Client } from '@amityco/ts-sdk-react-native';

// 3. Internal imports (relative)
import { Selection } from '../../../../../../core/design/atoms/Selection';
import { EmptyState } from '../../../../../features/shared/components/EmptyState';
import { UserItem } from '../UserItem/UserItem';
import { useSearchUsers } from '../../../../conversation/create/hooks/useSearchUsers';
import { useStyles } from './styles';

// Local constants (mirror AmityUiKitWeb v4/chat/constants).
const LIST_PAGE_LIMIT = 20;
const LIST_SKELETON_ROW_COUNT = 9;
const SEARCH_MIN_QUERY_LENGTH = 3;

// 4. Types
type UserListProps = {
  searchText: string;
  selectedUsers: Amity.User[];
  onChange: (users: Amity.User[]) => void;
};

// 5. Named function component
export function UserList({
  searchText,
  selectedUsers,
  onChange,
}: UserListProps) {
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

  const selectedIds = new Set(selectedUsers.map((user) => user.userId));

  function handleToggle(user: Amity.User, selected: boolean) {
    if (selected) {
      if (selectedIds.has(user.userId)) return;
      onChange([...selectedUsers, user]);
    } else {
      onChange(selectedUsers.filter((u) => u.userId !== user.userId));
    }
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
      renderItem={({ item }) => {
        const isSelected = selectedIds.has(item.userId);
        return (
          <Pressable
            onPress={() => handleToggle(item, !isSelected)}
            style={({ pressed }) => (pressed ? styles.rowPressed : undefined)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={item.displayName ?? item.userId}
          >
            <View pointerEvents="none">
              <Selection.Checkbox isSelected={isSelected}>
                <UserItem user={item} />
              </Selection.Checkbox>
            </View>
          </Pressable>
        );
      }}
      onEndReachedThreshold={0.7}
      onEndReached={() => {
        if (hasNextPage && !isLoadingFirstPage && !loading) loadMore();
      }}
      ListFooterComponent={footer}
    />
  );
}
