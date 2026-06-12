import { FlatList } from 'react-native';
import { useBlockedUsersCollection } from '../../../../../hooks/collections';
import { UserItem } from '../UserItem';
import { Empty } from '../../../../../components';
import { useStyles } from './styles';

export function UserList() {
  const { styles } = useStyles();
  const { blockedUsers, loadMore, hasMore, isLoading, isLoadingFirstPage } =
    useBlockedUsersCollection({
      limit: 20,
    });

  return (
    <FlatList
      data={blockedUsers}
      keyExtractor={(item) => item.userId}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => <UserItem user={item} />}
      ListEmptyComponent={
        !isLoading && !isLoadingFirstPage ? (
          <Empty heightPercent={0.7}>
            <Empty.Content icon="list" title="Nothing here to see yet" />
          </Empty>
        ) : null
      }
      ListFooterComponent={
        isLoading || isLoadingFirstPage ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <UserItem.Skeleton key={index} />
            ))}
          </>
        ) : null
      }
      onEndReached={() => {
        hasMore && !isLoading && !isLoadingFirstPage
          ? () => loadMore?.()
          : undefined;
      }}
    />
  );
}
