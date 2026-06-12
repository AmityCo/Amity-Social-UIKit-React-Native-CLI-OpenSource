import { forwardRef } from 'react';
import { getFileUrlWithSize } from '../../../../../utils';
import { FeedRef } from '../../types';
import { Gallery } from '../../../../../components/Gallery';
import { useImageFeed } from './hooks/useImageFeed';

type ImageFeedProps = {
  userId: string;
  isBrand?: boolean;
  isUserLoading?: boolean;
};

export const ImageFeed = forwardRef<FeedRef, ImageFeedProps>(function ImageFeed(
  { userId, isBrand, isUserLoading },
  ref
) {
  const {
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
  } = useImageFeed({ userId, isBrand, isUserLoading, ref });

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
    <Gallery<Amity.Post<'image'>>
      data={posts ?? []}
      keyExtractor={(item) => item.postId}
      isLoading={isLoadingFirstPage || isLoading}
      testID={imageFeedId}
      renderEmpty={() => (
        <Gallery.Empty title={emptyConfig?.text} icon="image" />
      )}
      renderItem={({ item }) => (
        <Gallery.Item
          uri={getFileUrlWithSize(item.getImageInfo()?.fileUrl!, 'medium')}
          onPress={() => {
            navigation.navigate('ImageViewer', {
              images: [
                {
                  uri: getFileUrlWithSize(
                    item.getImageInfo()?.fileUrl!,
                    'large'
                  ),
                },
              ],
            });
          }}
        />
      )}
    />
  );
});
