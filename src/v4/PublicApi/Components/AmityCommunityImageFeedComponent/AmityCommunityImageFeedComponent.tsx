import React, { FC, memo, useMemo } from 'react';
import { ComponentID, PageID } from '../../../enum';
import { useAmityComponent, useCommunity } from '../../../hook';
import { usePosts } from '../../../hook/usePosts';
import { View } from 'react-native';
import EmptyComponent from '../../../component/EmptyComponent/EmptyComponent';
import { emptyImagePost, privateFeed } from '../../../assets/icons';
import { useStyles } from './styles';
import ImageGallery from '../../../elements/ImageGallery/ImageGallery';

type AmityCommunityImageFeedComponentProps = {
  pageId?: PageID;
  communityId: string;
};

const pageLimit = 10;

const AmityCommunityImageFeedComponent: FC<
  AmityCommunityImageFeedComponentProps
> = ({ pageId = PageID.WildCardPage, communityId }) => {
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

  const styles = useStyles();

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
          title="No photos yet"
          icon={emptyImagePost}
          themeStyle={themeStyles}
        />
      </View>
    );
  }

  return (
    <ImageGallery
      isLoading={loading}
      posts={posts}
      onNextPage={onNextPage}
      accessibilityId={accessibilityId}
      themeStyles={themeStyles}
    />
  );
};

export default memo(AmityCommunityImageFeedComponent);
