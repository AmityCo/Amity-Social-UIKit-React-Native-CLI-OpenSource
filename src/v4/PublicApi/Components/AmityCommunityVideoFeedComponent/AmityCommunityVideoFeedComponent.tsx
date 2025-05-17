import React, { forwardRef, memo, useImperativeHandle, useMemo } from 'react';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent, useCommunity } from '../../../hook';
import { usePosts } from '../../../hook/usePosts';
import { View } from 'react-native';
import EmptyComponent from '../../../component/EmptyComponent/EmptyComponent';
import { emptyVideoPost, privateFeed } from '../../../assets/icons';
import VideoGallery from '../../../elements/VideoGallery/VideoGallery';
import { useStyles } from './styles';
import { AmityCommunityFeedRef } from '../AmityCommunityFeedComponent/AmityCommunityFeedComponent';

type AmityCommunityVideoFeedComponentProps = {
  pageId?: PageID;
  communityId: string;
};

const pageLimit = 10;

const AmityCommunityVideoFeedComponent = forwardRef<
  AmityCommunityFeedRef,
  AmityCommunityVideoFeedComponentProps
>(({ pageId = PageID.WildCardPage, communityId }, ref) => {
  const componentId = ComponentID.community_video_feed;
  const { community } = useCommunity(communityId);
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const dataTypes = useMemo(() => ['video'], []);

  const { posts, loading, onNextPage } = usePosts({
    targetId: communityId,
    targetType: 'community',
    dataTypes,
    limit: pageLimit,
  });

  const styles = useStyles();

  const handleLoadMore = () => {
    if (onNextPage) {
      onNextPage();
    }
  };

  useImperativeHandle(ref, () => ({
    handleLoadMore,
  }));

  if (!community?.isJoined && !community?.isPublic) {
    return (
      <View style={styles.otherStatesContainer}>
        <EmptyComponent
          title="You need to join this community to see the posts"
          icon={privateFeed}
          themeStyle={themeStyles}
        />
      </View>
    );
  }

  if (!loading && posts?.length === 0) {
    return (
      <View style={styles.otherStatesContainer}>
        <EmptyComponent
          title="No videos yet"
          icon={emptyVideoPost}
          themeStyle={themeStyles}
        />
      </View>
    );
  }

  return (
    <VideoGallery
      isLoading={loading}
      posts={posts}
      onNextPage={onNextPage}
      accessibilityId={accessibilityId}
      themeStyles={themeStyles}
    />
  );
});

export default memo(AmityCommunityVideoFeedComponent);
