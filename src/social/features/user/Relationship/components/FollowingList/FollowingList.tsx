import { useFollowingCollection } from '../../../../../hooks/collections';
import { UserList } from '../UserList';

type FollowingListProps = {
  userId: string;
};

export function FollowingList({ userId }: FollowingListProps) {
  const { followings, loadMore, hasMore, isLoading, isLoadingFirstPage } =
    useFollowingCollection({ userId });

  return (
    <UserList
      profileId={userId}
      data={followings}
      hasMore={hasMore}
      loadMore={loadMore}
      isLoading={isLoading}
      keyExtractor={(item) => item.to}
      isLoadingFirstPage={isLoadingFirstPage}
    />
  );
}
