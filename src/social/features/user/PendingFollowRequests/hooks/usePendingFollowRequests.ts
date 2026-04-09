import { useFollowerCollection } from '../../../../hooks/collections';
import { useFollowInfo } from '../../../../hooks/objects';
import useAuth from '../../../../../core/hooks/useAuth';
import { PageID } from '../../../../enums';
import { useAmityPage } from '../../../../hooks';
import { useStyles } from '../styles';

export function usePendingFollowRequests() {
  const { client } = useAuth();

  const { styles } = useStyles();
  const { accessibilityId } = useAmityPage({
    pageId: PageID.user_pending_follow_request_page,
  });

  const { followInfo } = useFollowInfo({
    userId: client?.userId ?? '',
    enabled: !!client?.userId,
  });

  const {
    hasMore,
    loadMore,
    isLoading,
    isLoadingFirstPage,
    followers: pendingRequests,
  } = useFollowerCollection({
    userId: client?.userId ?? '',
    status: 'pending',
    limit: 20,
  });

  return {
    pendingRequests,
    pendingCount: followInfo?.pendingCount ?? 0,
    isLoading,
    isLoadingFirstPage,
    hasMore,
    loadMore,
    styles,
    accessibilityId,
  };
}
