import React, { forwardRef, useMemo, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { usePosts } from '~/v4/hook/usePosts';
import VideoGallery from '~/v4/elements/VideoGallery/VideoGallery';
import EmptyComponent from '~/v4/component/EmptyComponent/EmptyComponent';
import { emptyVideoPost } from '~/v4/assets/icons';
import type { FeedRefType } from '~/v4/screen/CommunityHome';
import ImageFeedSkeleton from '~/v4/component/ImageFeedSkeleton/ImageFeedSkeleton';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

interface VideoComponentProps {
  userId: string;
}

const pageLimit = 10;

const VideoComponent = forwardRef<FeedRefType, VideoComponentProps>(
  ({ userId }, _ref) => {
    const theme = useTheme() as MyMD3Theme;

    const dataTypes = useMemo(() => ['video'], []);

    const { posts, loading, onNextPage } = usePosts({
      targetId: userId,
      targetType: 'user',
      dataTypes,
      limit: pageLimit,
    });

    useImperativeHandle(_ref, () => ({
      handleLoadMore: onNextPage,
    }));

    const videoPosts = posts as Amity.Post<'video'>[];

    if (loading) {
      return <ImageFeedSkeleton themeStyles={theme} />;
    }

    if (!videoPosts || videoPosts.length === 0) {
      return (
        <EmptyComponent
          icon={() => emptyVideoPost()}
          title="No video posts yet"
          description="Check back later for video content"
        />
      );
    }

    return (
      <View>
        <VideoGallery
          posts={videoPosts}
          onNextPage={onNextPage}
          isLoading={loading}
          themeStyles={theme}
        />
      </View>
    );
  }
);

VideoComponent.displayName = 'VideoComponent';

export default VideoComponent;
