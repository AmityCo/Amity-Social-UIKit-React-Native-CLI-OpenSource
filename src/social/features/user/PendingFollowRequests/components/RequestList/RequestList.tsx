import { FlatList, View } from 'react-native';
import { RequestItem } from '../RequestItem';
import { useStyles } from './styles';
import { Empty } from '../../../../../components';
import { useLiveCollection } from '../../../../../hooks/collections/useLiveCollection';

type RequestListProps = {
  requests: Amity.FollowStatus[];
} & Pick<
  ReturnType<typeof useLiveCollection>,
  'isLoading' | 'isLoadingFirstPage' | 'hasMore' | 'loadMore'
>;

function ItemSeparator() {
  const { styles } = useStyles();
  return <View style={styles.divider} />;
}

export function RequestList({
  requests,
  hasMore,
  loadMore,
  isLoading,
  isLoadingFirstPage,
}: RequestListProps) {
  const { styles } = useStyles();

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.from}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => <RequestItem userId={item.from} />}
      ListEmptyComponent={
        !isLoading && !isLoadingFirstPage ? (
          <Empty heightPercent={0.8}>
            <Empty.Content icon="review" title="No requests to review" />
          </Empty>
        ) : null
      }
      ListFooterComponent={
        isLoading || isLoadingFirstPage ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <RequestItem.Skeleton key={index} />
            ))}
          </>
        ) : null
      }
      onEndReached={() => {
        if (hasMore && !isLoading && !isLoadingFirstPage) {
          loadMore?.();
        }
      }}
    />
  );
}
