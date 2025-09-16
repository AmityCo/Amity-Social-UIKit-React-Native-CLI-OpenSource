import { useStyles } from './styles';
import React from 'react';
import { ComponentID, PageID } from '~/v4/enum';
import { useAmityComponent, useCommunity } from '~/v4/hook';
import AmityPostContentComponent from '../AmityPostContentComponent/AmityPostContentComponent';
import Divider from '~/v4/component/Divider';
import { View, FlatList } from 'react-native';
import {
  AmityPostCategory,
  AmityPostContentComponentStyleEnum,
} from '~/v4/enum/AmityPostContentComponentStyle';
import EmptyComponent from '~/v4/component/EmptyComponent/EmptyComponent';
import { emptyPost, privateFeed } from '~/v4/assets/icons';
import PostFeedSkeleton from '~/v4/component/PostFeedSkeleton';
import { usePinnedPostCollection } from '~/v4/hook/collections/usePinnedPostCollection';

type AmityCommunityPinnedPostComponentProps = {
  communityId: string;
};

function AmityCommunityPinnedPostComponent({
  communityId,
}: AmityCommunityPinnedPostComponentProps) {
  const styles = useStyles();
  const { accessibilityId, themeStyles } = useAmityComponent({
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
      <View style={styles.listContainer}>
        <EmptyComponent
          icon={privateFeed}
          themeStyle={themeStyles}
          title="This community is private"
          description="Join this community to see its content and members."
        />
      </View>
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
        <View style={styles.listContainer}>
          <EmptyComponent
            icon={emptyPost}
            themeStyle={themeStyles}
            title="No pinned post yet"
          />
        </View>
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
            {index !== 0 && <Divider themeStyles={themeStyles} />}
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
