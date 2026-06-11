import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { PostRepository } from '@amityco/ts-sdk-react-native';
import { emptyPost } from '../../../../../core/assets/icons';
import { Typography } from '../../../../../core/components/Typography/Typography';
import PostFeedSkeleton from '../../../../components/PostFeedSkeleton/PostFeedSkeleton';
import AmityPostContentComponent from '../../../post/components/Content';
import {
  AmityPostCategory,
  AmityPostContentComponentStyleEnum,
} from '../../../../enums/AmityPostContentComponentStyle';
import { EVENTS_STRINGS } from '../../constants';
import { useAmityComponent } from '../../../../hooks';
import { ComponentID, PageID } from '../../../../enums';

export type EventDiscussionRef = {
  loadMore: () => void;
};

type EventDiscussionProps = {
  pageId?: PageID;
  event: Amity.Event;
};

/**
 * Web parity: EventDiscussion — community posts of the event's discussion
 * community (the event's own livestream post filtered out). The composer FAB
 * lives on the page so it can float above this scrolled content; it is
 * hidden for visitors and non-members there.
 */
const EventDiscussion = forwardRef<EventDiscussionRef, EventDiscussionProps>(
  ({ pageId = PageID.event_detail_page, event }, ref) => {
    const componentId = ComponentID.event_discussion;
    const { accessibilityId, isExcluded, themeStyles } = useAmityComponent({
      pageId,
      componentId,
    });

    const [posts, setPosts] = useState<Amity.Post[]>([]);
    const [loading, setLoading] = useState(true);
    const onNextPageRef = useRef<(() => void) | null>(null);
    const receivedFirstPageRef = useRef(false);

    useEffect(() => {
      if (!event.discussionCommunityId) {
        setLoading(false);
        return undefined;
      }
      const unsubscribe = PostRepository.getPosts(
        {
          targetType: 'community',
          targetId: event.discussionCommunityId,
          limit: 20,
        },
        ({ data, error, loading: isLoading, hasNextPage, onNextPage }) => {
          if (error) {
            setLoading(false);
            return;
          }
          if (!isLoading) {
            receivedFirstPageRef.current = true;
            setPosts(data ?? []);
            onNextPageRef.current = hasNextPage ? onNextPage : null;
          }
          setLoading(isLoading);
        }
      );
      return unsubscribe;
    }, [event.discussionCommunityId]);

    useImperativeHandle(ref, () => ({
      loadMore: () => {
        if (!loading) onNextPageRef.current?.();
      },
    }));

    const styles = StyleSheet.create({
      container: {
        gap: 12,
        paddingBottom: 48,
        backgroundColor: themeStyles.colors.background,
      },
      emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 8,
      },
      emptyText: {
        marginTop: 4,
        textAlign: 'center',
        color: themeStyles.colors.baseShade3,
      },
    });

    if (isExcluded) return null;

    const discussionPosts = posts.filter(
      (post) => post.postId !== event.postId
    );
    const isLoadingFirstPage = loading && !receivedFirstPageRef.current;

    return (
      <View
        style={styles.container}
        testID={accessibilityId}
        accessibilityLabel={accessibilityId}
      >
        {!isLoadingFirstPage && discussionPosts.length === 0 && (
          <View style={styles.emptyContainer}>
            <SvgXml
              xml={emptyPost()}
              width={60}
              height={60}
              color={themeStyles.colors.secondaryShade4}
            />
            {/* Web parity: amity_social_empty_feed_no_posts default copy */}
            <Typography.TitleBold style={styles.emptyText}>
              {EVENTS_STRINGS.EMPTY_DISCUSSION}
            </Typography.TitleBold>
          </View>
        )}
        {discussionPosts.map((post) => (
          <AmityPostContentComponent
            key={post.postId}
            post={post}
            pageId={pageId}
            category={AmityPostCategory.GENERAL}
            AmityPostContentComponentStyle={
              AmityPostContentComponentStyleEnum.feed
            }
          />
        ))}
        {isLoadingFirstPage && <PostFeedSkeleton />}
      </View>
    );
  }
);

export default memo(EventDiscussion);
