// UserList — the multi-select searchable user list for add-member.
// Ported from AmityUiKitWeb v4/chat/features/group/select-member/components/UserList
// (the multi-select variant AddGroupMember consumes), not the single-select
// create-conversation list.
//
// RN adaptations: web's react-aria CheckboxGroup + IntersectionObserver sentinel
// → RN `Selection.Checkbox` rows in a FlatList with `onEndReached`; web's
// `useSearchUserByDisplayName` → the shared `useSearchUsers` live-collection hook
// (reused from the create flow). The 1–2 char partial-query gate matches web
// exactly (empty query still browses all).

// 1. React / RN imports
import { useMemo, type ReactElement } from 'react';
import { FlatList, View } from 'react-native';

// 2. Third-party imports
import { Client } from '@amityco/ts-sdk-react-native';

// 3. Internal imports
import { Selection } from '../../../../../../core/design/atoms/Selection';
import { Typography } from '../../../../../../core/design/components/Typography';
import { Skeleton } from '../../../../../../core/design/components/Skeleton';
import useFile from '../../../../../../core/hooks/useFile';
import { Avatar } from '../../../../../elements/Avatar';
import { EmptyState } from '../../../../../features/shared/components/EmptyState';
import { useSearchUsers } from '../../../../conversation/create/hooks';
import { useStyles } from './styles';

// Local constants (mirror AmityUiKitWeb v4/chat/constants).
const LIST_PAGE_LIMIT = 20;
const LIST_SKELETON_ROW_COUNT = 9;
const SEARCH_MIN_QUERY_LENGTH = 3;

// 3. Types
type UserListProps = {
  searchText: string;
  selectedUsers: Amity.InternalUser[];
  onChange: (users: Amity.InternalUser[]) => void;
};

// Checkbox row — avatar + display name, toggled via the Selection.Checkbox.
function UserRow({
  user,
  isSelected,
  onToggle,
}: {
  user: Amity.InternalUser;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const { styles } = useStyles();
  const displayName = user.displayName ?? user.userId;
  const avatarUrl = useFile({ fileId: user.avatarFileId ?? '' });

  return (
    <Selection.Checkbox
      isSelected={isSelected}
      onChange={onToggle}
      accessibilityLabel={displayName}
    >
      <View style={styles.rowContent}>
        <Avatar.User
          avatarUrl={avatarUrl}
          displayName={displayName}
          size="md"
        />
        <Typography variant="bodyBold" style={styles.name} numberOfLines={1}>
          {displayName}
        </Typography>
      </View>
    </Selection.Checkbox>
  );
}

function UserRowSkeleton() {
  const { styles } = useStyles();
  return (
    <View style={styles.skeletonRow}>
      <Skeleton circle width={40} height={40} />
      <Skeleton width={140} height={10} />
    </View>
  );
}

// 4. Named function component
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

  const selectedIds = useMemo(
    () => new Set(selectedUsers.map((u) => u.userId)),
    [selectedUsers]
  );

  if (isPartialQuery) {
    return <EmptyState variant="prompt" />;
  }

  const visibleUsers = users.filter((user) => user.userId !== currentUserId);

  if (visibleUsers.length === 0 && !loading) {
    return <EmptyState variant="no-results" />;
  }

  function toggleUser(user: Amity.InternalUser) {
    if (selectedIds.has(user.userId)) {
      onChange(selectedUsers.filter((u) => u.userId !== user.userId));
    } else {
      onChange([...selectedUsers, user]);
    }
  }

  const footer: ReactElement | null =
    isLoadingFirstPage || loading ? (
      <>
        {Array.from({ length: LIST_SKELETON_ROW_COUNT }).map((_, i) => (
          <UserRowSkeleton key={i} />
        ))}
      </>
    ) : null;

  return (
    <FlatList
      style={styles.userList}
      data={visibleUsers}
      keyExtractor={(user) => user.userId}
      renderItem={({ item }) => (
        <UserRow
          user={item}
          isSelected={selectedIds.has(item.userId)}
          onToggle={() => toggleUser(item)}
        />
      )}
      onEndReachedThreshold={0.7}
      onEndReached={() => {
        if (hasNextPage && !isLoadingFirstPage && !loading) loadMore();
      }}
      ListFooterComponent={footer}
    />
  );
}
