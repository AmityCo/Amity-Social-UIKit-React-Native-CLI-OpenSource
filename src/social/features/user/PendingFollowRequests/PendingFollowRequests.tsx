import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../../../core/components/Typography/Typography';
import { TopBar, RequestList } from './components';
import { usePendingFollowRequests } from './hooks/usePendingFollowRequests';

export function PendingFollowRequests() {
  const {
    pendingRequests,
    pendingCount,
    isLoading,
    isLoadingFirstPage,
    hasMore,
    loadMore,
    styles,
    accessibilityId,
  } = usePendingFollowRequests();

  return (
    <SafeAreaView
      testID={accessibilityId}
      style={styles.container}
      edges={['top']}
    >
      <TopBar count={pendingCount} />
      <View style={styles.banner}>
        <Typography.Caption style={styles.bannerText}>
          Declining a follow request is irreversible. The user must send a new
          request if declined.
        </Typography.Caption>
      </View>
      <RequestList
        hasMore={hasMore}
        loadMore={loadMore}
        isLoading={isLoading}
        requests={pendingRequests}
        isLoadingFirstPage={isLoadingFirstPage}
      />
    </SafeAreaView>
  );
}
