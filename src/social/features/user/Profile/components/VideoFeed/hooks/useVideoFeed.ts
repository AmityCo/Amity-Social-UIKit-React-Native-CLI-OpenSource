import { useImperativeHandle } from 'react';
import { FeedDataTypeEnum, FeedSourceEnum } from '@amityco/ts-sdk-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';
import { useAmityComponent, useAmityElement } from '../../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../../enums';
import { useFeedState } from '../../../hooks/useFeedState';
import useUserFeed from '../../../../../../hooks/collections/post/useUserFeed';
import { FeedRef } from '../../../types';

type UseVideoFeedParams = {
  userId: string;
  ref: React.ForwardedRef<FeedRef>;
};

export function useVideoFeed({ userId, ref }: UseVideoFeedParams) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isBlockedByMe, isPrivate, feedEnabled } = useFeedState({ userId });

  const pageId = PageID.user_profile_page;
  const componentId = ComponentID.user_video_feed;

  const { accessibilityId: videoFeedId } = useAmityComponent({
    pageId,
    componentId,
  });
  const { config: emptyConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.empty_user_video_feed,
  });
  const { config: privateConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.private_user_video_feed,
  });
  const { config: privateInfoConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.private_user_video_feed_info,
  });
  const { config: blockedConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.blocked_user_video_feed,
  });
  const { config: blockedInfoConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.blocked_user_video_feed_info,
  });

  const { posts, hasMore, loadMore, isLoading, isLoadingFirstPage } =
    useUserFeed<'video'>({
      userId,
      enabled: feedEnabled,
      feedSources: [FeedSourceEnum.User],
      dataTypes: [FeedDataTypeEnum.Video],
    });

  useImperativeHandle(
    ref,
    () => ({
      loadMore: () =>
        hasMore && !isLoading && !isLoadingFirstPage && loadMore?.(),
      loading: isLoadingFirstPage || isLoading,
    }),
    [hasMore, isLoadingFirstPage, loadMore, isLoading]
  );

  return {
    navigation,
    videoFeedId,
    posts,
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
