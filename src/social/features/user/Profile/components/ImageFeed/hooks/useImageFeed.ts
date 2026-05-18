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

type UseImageFeedParams = {
  userId: string;
  isBrand?: boolean;
  isUserLoading?: boolean;
  ref: React.ForwardedRef<FeedRef>;
};

export function useImageFeed({
  userId,
  isBrand,
  isUserLoading,
  ref,
}: UseImageFeedParams) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isBlockedByMe, isPrivate, feedEnabled } = useFeedState({
    userId,
    isBrand,
    isUserLoading,
  });

  const pageId = PageID.user_profile_page;
  const componentId = ComponentID.user_image_feed;

  const { accessibilityId: imageFeedId } = useAmityComponent({
    pageId,
    componentId,
  });
  const { config: emptyConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.empty_user_image_feed,
  });
  const { config: privateConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.private_user_image_feed,
  });
  const { config: privateInfoConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.private_user_image_feed_info,
  });
  const { config: blockedConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.blocked_user_image_feed,
  });
  const { config: blockedInfoConfig } = useAmityElement({
    pageId,
    componentId,
    elementId: ElementID.blocked_user_image_feed_info,
  });

  const { posts, hasMore, loadMore, isLoading, isLoadingFirstPage } =
    useUserFeed<'image'>({
      userId,
      enabled: feedEnabled,
      feedSources: [FeedSourceEnum.User],
      dataTypes: [FeedDataTypeEnum.Image],
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
    imageFeedId,
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
