import { useImperativeHandle } from 'react';
import { FeedDataTypeEnum, FeedSourceEnum } from '@amityco/ts-sdk-react-native';
import { useAmityComponent, useAmityElement } from '../../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../../enums';
import { useFeedState } from '../../../hooks/useFeedState';
import useUserFeed from '../../../../../../hooks/collections/post/useUserFeed';
import { FeedRef } from '../../../types';

type UseFeedParams = {
  userId: string;
  ref: React.ForwardedRef<FeedRef>;
};

export function useFeed({ userId, ref }: UseFeedParams) {
  const { isBlockedByMe, isPrivate, feedEnabled } = useFeedState({ userId });

  const pageId = PageID.user_profile_page;
  const componentId = ComponentID.user_feed;

  const { accessibilityId: feedId } = useAmityComponent({
    pageId,
    componentId,
  });
  const { config: emptyConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.empty_user_feed,
  });
  const { config: privateConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.private_user_feed,
  });
  const { config: privateInfoConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.private_user_feed_info,
  });
  const { config: blockedConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.blocked_user_feed,
  });
  const { config: blockedInfoConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.blocked_user_feed_info,
  });

  const { posts, hasMore, loadMore, isLoading, isLoadingFirstPage } =
    useUserFeed<any>({
      userId,
      enabled: feedEnabled,
      feedSources: [FeedSourceEnum.User],
      matchingOnlyParentPost: true,
      dataTypes: [
        FeedDataTypeEnum.Text,
        FeedDataTypeEnum.Image,
        FeedDataTypeEnum.Video,
        FeedDataTypeEnum.Poll,
        FeedDataTypeEnum.Clip,
        FeedDataTypeEnum.LiveStream,
        FeedDataTypeEnum.Room,
      ],
    });

  useImperativeHandle(
    ref,
    () => ({
      loadMore: () =>
        hasMore && !isLoading && !isLoadingFirstPage && loadMore?.(),
    }),
    [hasMore, isLoadingFirstPage, loadMore, isLoading]
  );

  return {
    feedId,
    posts,
    hasMore,
    isLoading,
    isLoadingFirstPage,
    isBlockedByMe,
    isPrivate,
    emptyConfig,
    privateConfig,
    privateInfoConfig,
    blockedConfig,
    blockedInfoConfig,
  };
}
