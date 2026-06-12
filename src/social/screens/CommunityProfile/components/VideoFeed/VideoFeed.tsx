import { forwardRef, memo, useImperativeHandle, useMemo } from 'react';
import { ComponentID, PageID } from '../../../../enums';
import { useAmityComponent, useCommunity } from '../../../../hooks';
import { usePosts } from '../../../../hooks/usePosts';
import { Empty } from '../../../../components';
import VideoGallery from '../../../../elements/VideoGallery/VideoGallery';
import { AmityCommunityFeedRef } from '../Feed';
import ImageFeedSkeleton from '../../../../components/ImageFeedSkeleton/ImageFeedSkeleton';

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
      <Empty heightPercent={0.3}>
        <Empty.Content
          title="This community is private"
          description="Join this community to see its content and members."
          icon="private"
        />
      </Empty>
    );
  }

  if (loading && (!posts || posts?.length === 0)) {
    return <ImageFeedSkeleton themeStyles={themeStyles} />;
  }

  if (!loading && posts?.length === 0) {
    return (
      <Empty heightPercent={0.3}>
        <Empty.Content title="No videos yet" icon="video" />
      </Empty>
    );
  }

  return (
    <VideoGallery
      isLoading={loading}
      posts={posts as Amity.Post<'video'>[]}
      onNextPage={onNextPage}
      accessibilityId={accessibilityId}
      themeStyles={themeStyles}
    />
  );
});

export default memo(AmityCommunityVideoFeedComponent);
