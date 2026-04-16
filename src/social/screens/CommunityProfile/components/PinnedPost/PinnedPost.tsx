import { useStyles } from './styles';
import { ComponentID, PageID } from '../../../../enums';
import { useAmityComponent, useCommunity } from '../../../../hooks';
import AmityPostContentComponent from '../../../../features/post/components/Content/Content';
import Divider from '../../../../components/Divider';
import { View, FlatList } from 'react-native';
import {
  AmityPostCategory,
  AmityPostContentComponentStyleEnum,
} from '../../../../enums/AmityPostContentComponentStyle';
import { Empty } from '../../../../components';
import PostFeedSkeleton from '../../../../components/PostFeedSkeleton';
import { usePinnedPostCollection } from '../../../../hooks/collections/post/usePinnedPostCollection';

type AmityCommunityPinnedPostComponentProps = {
  communityId: string;
};

function AmityCommunityPinnedPostComponent({
  communityId,
}: AmityCommunityPinnedPostComponentProps) {
  const styles = useStyles();
  const { accessibilityId } = useAmityComponent({
    pageId: PageID.community_profile_page,
    componentId: ComponentID.community_pin,
  });

  const { community } = useCommunity(communityId);
  const pinnedPostCollection = usePinnedPostCollection({
    enabled: !!communityId,
    params: {
      communityId,
      sortBy: 'lastPinned',
    },
  });

  if (!community?.isJoined && !community?.isPublic) {
    return (
      <Empty heightPercent={0.3}>
        <Empty.Content
          icon="private"
          title="This community is private"
          description="Join this community to see its content and members."
        />
      </Empty>
    );
  }

  if (pinnedPostCollection.isLoading) {
    return <PostFeedSkeleton />;
  }

  const announcementPosts = pinnedPostCollection.data.filter(
    (announcementPost) =>
      announcementPost.placement === 'announcement' &&
      pinnedPostCollection.data.some(
        (pinnedPost) =>
          pinnedPost.placement === 'default' &&
          pinnedPost.referenceId === announcementPost.referenceId
      )
  );

  const pinnedPostsWithoutAnnouncement = pinnedPostCollection.data
    .filter((item) => item.placement === 'default')
    .filter(
      (post) =>
        !announcementPosts.some(
          (announcement) => announcement.referenceId === post.referenceId
        )
    );

  const pinnedPosts = pinnedPostCollection.data.filter(
    (post) => post.placement === 'default'
  );

  return (
    <FlatList
      scrollEnabled={false}
      testID={accessibilityId}
      contentContainerStyle={styles.container}
      keyExtractor={(item) => item.post.postId}
      accessibilityLabel="Community Pinned Post List"
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
      data={[
        ...announcementPosts,
        ...(announcementPosts.length > 0
          ? pinnedPostsWithoutAnnouncement
          : pinnedPosts),
      ]}
      ListEmptyComponent={
        <Empty heightPercent={0.3}>
          <Empty.Content icon="post" title="No pinned post yet" />
        </Empty>
      }
      onEndReached={() => {
        if (
          pinnedPostCollection.hasNextPage &&
          !pinnedPostCollection.isFetchingNextPage
        )
          pinnedPostCollection.fetchNextPage?.();
      }}
      ListFooterComponent={
        pinnedPostCollection.isFetchingNextPage ? <PostFeedSkeleton /> : null
      }
      renderItem={({ item, index }) => {
        return (
          <View>
            {index !== 0 && <Divider />}
            <AmityPostContentComponent
              post={item.post}
              category={
                item.placement === 'announcement'
                  ? AmityPostCategory.PIN_AND_ANNOUNCEMENT
                  : AmityPostCategory.PIN
              }
              isCommunityNameShown={false}
              AmityPostContentComponentStyle={
                AmityPostContentComponentStyleEnum.feed
              }
            />
          </View>
        );
      }}
    />
  );
}

export default AmityCommunityPinnedPostComponent;
