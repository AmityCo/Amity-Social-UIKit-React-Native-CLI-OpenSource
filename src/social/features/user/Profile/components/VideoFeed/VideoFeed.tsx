import { forwardRef } from 'react';
import { getFileUrlWithSize } from '../../../../../utils';
import { FeedRef } from '../../types';
import { Gallery } from '../../../../../components/Gallery';
import { useVideoFeed } from './hooks/useVideoFeed';

type VideoFeedProps = {
  userId: string;
};

export const VideoFeed = forwardRef<FeedRef, VideoFeedProps>(function VideoFeed(
  { userId },
  ref
) {
  const {
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
  } = useVideoFeed({ userId, ref });

  if (isBlockedByMe) {
    return (
      <Gallery.Empty
        icon="block"
        title={blockedConfig?.text}
        description={blockedInfoConfig?.text}
      />
    );
  }

  if (isPrivate) {
    return (
      <Gallery.Empty
        icon="private"
        title={privateConfig?.text}
        description={privateInfoConfig?.text}
      />
    );
  }

  return (
    <Gallery<Amity.Post<'video'>>
      data={posts ?? []}
      keyExtractor={(item) => item.postId}
      isLoading={isLoadingFirstPage || isLoading}
      testID={videoFeedId}
      renderEmpty={() => (
        <Gallery.Empty title={emptyConfig?.text} icon="video" />
      )}
      renderItem={({ item }) => (
        <Gallery.Item
          timestamp={
            (item.getVideoInfo()?.attributes?.metadata?.video as any)?.duration
          }
          uri={getFileUrlWithSize(
            item.getVideoThumbnailInfo()?.fileUrl!,
            'medium'
          )}
          onPress={() =>
            navigation.navigate('VideoPlayer', {
              source: item.getVideoInfo().fileUrl,
            })
          }
        />
      )}
    />
  );
});
