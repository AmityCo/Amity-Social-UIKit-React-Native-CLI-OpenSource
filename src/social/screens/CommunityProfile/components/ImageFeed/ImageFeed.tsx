import { memo, useMemo, forwardRef, useImperativeHandle } from 'react';
import { ComponentID, PageID } from '../../../../enums';
import { useAmityComponent, useCommunity } from '../../../../hooks';
import { usePosts } from '../../../../hooks/usePosts';
import { Empty } from '../../../../components';
import ImageGallery from '../../../../elements/ImageGallery/ImageGallery';
import { AmityCommunityFeedRef } from '../Feed';
import ImageFeedSkeleton from '../../../../components/ImageFeedSkeleton/ImageFeedSkeleton';

type AmityCommunityImageFeedComponentProps = {
  pageId?: PageID;
  communityId: string;
};

const pageLimit = 10;

const AmityCommunityImageFeedComponent = forwardRef<
  AmityCommunityFeedRef,
  AmityCommunityImageFeedComponentProps
>(({ pageId = PageID.WildCardPage, communityId }, ref) => {
  const componentId = ComponentID.community_image_feed;
  const { community } = useCommunity(communityId);
  const { accessibilityId, themeStyles } = useAmityComponent({
    pageId,
    componentId,
  });

  const imageDataTypes = useMemo(() => ['image'], []);

  const { posts, loading, onNextPage } = usePosts({
    targetId: communityId,
    targetType: 'community',
    dataTypes: imageDataTypes,
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
        <Empty.Content title="No photos yet" icon="image" />
      </Empty>
    );
  }

  return (
    <ImageGallery
      isLoading={loading}
      posts={posts as Amity.Post<'image'>[]}
      onNextPage={onNextPage}
      accessibilityId={accessibilityId}
      themeStyles={themeStyles}
    />
  );
});

export default memo(AmityCommunityImageFeedComponent);
