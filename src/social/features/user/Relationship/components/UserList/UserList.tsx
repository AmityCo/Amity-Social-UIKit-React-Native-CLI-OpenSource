import { FlatList } from 'react-native';
import { UserItem } from '../UserItem';
import { Empty } from '../../../../../components';
import { useStyles } from './styles';
import { useLiveCollection } from '../../../../../hooks/collections/useLiveCollection';

type UserListProps = Pick<
  ReturnType<typeof useLiveCollection<Amity.FollowStatus>>,
  'isLoading' | 'isLoadingFirstPage' | 'hasMore' | 'loadMore'
> & {
  profileId: string;
  data: Amity.FollowStatus[];
  keyExtractor: (item: Amity.FollowStatus) => string;
};

export function UserList({
  data,
  profileId,
  keyExtractor,
  isLoading,
  isLoadingFirstPage,
  hasMore,
  loadMore,
}: UserListProps) {
  const { styles } = useStyles();

  return (
    <FlatList
      data={data}
      contentContainerStyle={styles.container}
      keyExtractor={(item) => keyExtractor(item)}
      renderItem={({ item }) => (
        <UserItem profileId={profileId} userId={keyExtractor(item)} />
      )}
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
      onEndReached={
        hasMore && !isLoading && !isLoadingFirstPage
          ? () => loadMore?.()
          : undefined
      }
    />
  );
}
