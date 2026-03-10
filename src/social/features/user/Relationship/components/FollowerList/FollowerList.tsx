import { useFollowerCollection } from '../../../../../hooks/collections';
import { UserList } from '../UserList';

type FollowerListProps = {
  userId: string;
};

export function FollowerList({ userId }: FollowerListProps) {
  const { followers, loadMore, hasMore, isLoading, isLoadingFirstPage } =
    useFollowerCollection({ userId });

  return (
    <UserList
      data={followers}
      profileId={userId}
      keyExtractor={(item) => item.from}
      isLoading={isLoading}
      isLoadingFirstPage={isLoadingFirstPage}
      hasMore={hasMore}
      loadMore={loadMore}
    />
  );
}
