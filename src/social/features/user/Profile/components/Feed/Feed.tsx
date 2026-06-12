import { forwardRef } from 'react';
import { View, FlatList } from 'react-native';
import Divider from '../../../../../components/Divider';
import PostFeedSkeleton from '../../../../../components/PostFeedSkeleton';
import AmityPostContentComponent from '../../../../post/components/Content';
import { AmityPostContentComponentStyleEnum } from '../../../../../enums/AmityPostContentComponentStyle';
import { useStyles } from './styles';
import { FeedRef } from '../../types';
import { Gallery } from '../../../../../components/Gallery';
import { useFeed } from './hooks/useFeed';

type UserFeedProps = {
  userId: string;
  isBrand?: boolean;
  isUserLoading?: boolean;
};

export const Feed = forwardRef<FeedRef, UserFeedProps>(function Feed(
  { userId, isBrand, isUserLoading },
  ref
) {
  const { styles } = useStyles();
  const {
    feedId,
    posts,
    hasMore,
    isLoading,
    isLoadingFirstPage,
    isBlockedByMe,
    isPrivate,
    emptyConfig,
    privateConfig,
    privateInfoConfig,
    blockedConfig,
    blockedInfoConfig,
  } = useFeed({ userId, isBrand, isUserLoading, ref });

  if (isBlockedByMe) {
    return (
      <View testID={feedId} style={styles.container}>
        <Gallery.Empty
          heightPercent={0.4}
          icon="block"
          title={blockedConfig?.text}
          description={blockedInfoConfig?.text}
        />
      </View>
    );
  }

  if (isPrivate) {
    return (
      <View testID={feedId} style={styles.container}>
        <Gallery.Empty
          heightPercent={0.4}
          icon="private"
          title={privateConfig?.text}
          description={privateInfoConfig?.text}
        />
      </View>
    );
  }

  return (
    <View testID={feedId} style={styles.container}>
      <FlatList
        data={posts ?? []}
        scrollEnabled={false}
        keyExtractor={(item) => item.postId.toString()}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
        ListFooterComponent={
          isLoading || isLoadingFirstPage ? <PostFeedSkeleton /> : null
        }
        ListEmptyComponent={
          isLoading || isLoadingFirstPage ? null : (
            <Gallery.Empty
              heightPercent={0.4}
              title={emptyConfig?.text}
              icon="post"
            />
          )
        }
        renderItem={({ item, index }) => (
          <View>
            <AmityPostContentComponent
              post={item}
              isCommunityNameShown={false}
              AmityPostContentComponentStyle={
                AmityPostContentComponentStyleEnum.feed
              }
            />
            {index === posts.length - 1 && !hasMore ? null : <Divider />}
          </View>
        )}
      />
    </View>
  );
});
