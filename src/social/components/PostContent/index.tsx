import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { PostRepository } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import useAuth from '../../../core/hooks/useAuth';
import { IVideoPost, MediaUri } from '../legacy/Social/PostList';
import { fetchPostOnce } from '../../utils/fetchPostOnce';
import ImageView from '../legacy/react-native-image-viewing/dist';
import { SvgXml } from 'react-native-svg';
import { clearIcon } from '../../../core/assets/icons/xml';
import { RootState, useUIKitSelector } from '../../../core/stores/store';
import {
  PostMediaElement,
  type PostMediaControls,
} from '../../elements/PostMediaElement';
import LivestreamContent from '../LivestreamContent';
import { LinkPreview } from '../PreviewLink';
import RenderTextWithMention from '../RenderTextWithMention/RenderTextWithMention';
import { IMentionPosition } from '../../../core/types';
import PollContent from '../PollContent';
import { MediaViewer, type MediaViewerItem } from '../MediaViewer';
import {
  childIdsToRecheck,
  classifyPostChildren,
  mergeFreshChildren,
  type LoadedPostChild,
} from '../../utils/postChildren';

interface IPostContent {
  post: Amity.Post;
  textPost?: string;
  disabledPoll?: boolean;
  childrenPosts: string[];
  onPressPost?: () => void;
  showedAllOptions?: boolean;
  mentionPositionArr?: IMentionPosition[];
}
const PostContent: React.FC<IPostContent> = ({
  post,
  textPost,
  onPressPost,
  disabledPoll,
  childrenPosts,
  showedAllOptions,
  mentionPositionArr,
}) => {
  const { apiRegion } = useAuth();
  const [imagePosts, setImagePosts] = useState<string[]>([]);
  const [videoPosts, setVideoPosts] = useState<IVideoPost[]>([]);
  const [pollIds, setPollIds] = useState<{ pollId: string }[]>([]);
  const [livestreamId, setLivestreamId] = useState<Amity.Room['roomId'][]>([]);

  const [imagePostsFullSize, setImagePostsFullSize] = useState<MediaUri[]>([]);
  const [videoPostsFullSize, setVideoPostsFullSize] = useState<MediaUri[]>([]);
  const [visibleFullImage, setIsVisibleFullImage] = useState<boolean>(false);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [videoViewerIndex, setVideoViewerIndex] = useState<number | null>(null);
  const [mediaLoading, setMediaLoading] = useState<boolean>(
    (childrenPosts?.length ?? 0) > 0
  );
  const [mediaChildPosts, setMediaChildPosts] = useState<Amity.Post[]>([]);

  const mediaControlsRef = useRef<PostMediaControls | null>(null);
  const viewerIndexRef = useRef<number>(0);

  const styles = useStyles();
  // The children as last loaded, and the ids among them worth reading again
  // (see childIdsToRecheck).
  const loadedChildrenRef = useRef<LoadedPostChild[]>([]);
  const [recheckKey, setRecheckKey] = useState('');
  // A string, so a post object rebuilt with the same children doesn't count
  // as a change.
  const childrenKey = (childrenPosts ?? []).join(',');

  useEffect(() => {
    setImagePostsFullSize([]);
    setVideoPostsFullSize([]);
    if (imagePosts.length > 0) {
      const updatedUrls: MediaUri[] = imagePosts.map((url: string) => {
        return {
          uri: url.replace('size=medium', 'size=large'),
        };
      });
      setImagePostsFullSize(updatedUrls);
    }
    if (videoPosts.length > 0) {
      const updatedUrls: MediaUri[] = videoPosts.map((item: IVideoPost) => {
        return {
          uri: `https://api.${apiRegion}.amity.co/api/v3/files/${item?.thumbnailFileId}/download?size=large`,
        };
      });
      setVideoPostsFullSize(updatedUrls);
    }
  }, [imagePosts, videoPosts, apiRegion]);

  const showChildren = useCallback(
    (children: LoadedPostChild[]) => {
      loadedChildrenRef.current = children;
      setRecheckKey(childIdsToRecheck(children).join(','));

      const { images, videos, polls, livestreams, media } =
        classifyPostChildren(children, apiRegion);

      // Set unconditionally so navigating to a post without media clears the
      // previous media. Never cleared first: that unmounted the images, so
      // they blanked until the new data put them back.
      setMediaChildPosts(media);
      setImagePosts(images);
      setVideoPosts(videos);
      if (polls.length > 0) {
        setPollIds(polls);
      }
      if (livestreams.length > 0) {
        setLivestreamId(livestreams);
      }
    },
    [apiRegion]
  );

  // Loads the children when they change: on mount, and when an edit adds or
  // removes some. It used to reload them on every feed update through the
  // legacy getPostById, which resolved before the data arrived and never
  // unsubscribed: one GET /posts/{id} per child of every post on screen after
  // any reaction or comment, and a live subscription left behind each time.
  useEffect(() => {
    let stale = false;
    const ids = childrenKey ? childrenKey.split(',') : [];
    setMediaLoading(ids.length > 0);
    Promise.all(
      ids.map(async (id): Promise<LoadedPostChild> => {
        const child = await fetchPostOnce(id);
        return {
          id,
          post: child,
          dataType: child?.dataType,
          data: child?.data as Record<string, any> | undefined,
        };
      })
    )
      .then((children) => {
        if (!stale) showChildren(children);
      })
      .catch((error) => console.log('error: ', error))
      .finally(() => {
        if (!stale) setMediaLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [childrenKey, showChildren]);

  // The few children that can still change are read again on the same feed
  // updates that used to reload everything: a video until its thumbnail
  // exists, and a child that could not be read. Straight from the server
  // (getPostByIds), as getPost would answer from its cache for a minute. A
  // card with nothing to re-check selects nothing, so it no longer re-renders
  // on every feed change.
  const needsRecheck = recheckKey !== '';
  const globalFeedPosts = useUIKitSelector((state: RootState) =>
    needsRecheck ? state.globalFeed.postList : null
  );
  const feedPosts = useUIKitSelector((state: RootState) =>
    needsRecheck ? state.feed.postList : null
  );
  const detailPost = useUIKitSelector((state: RootState) =>
    needsRecheck ? state.postDetail.currentPostdetail : null
  );

  useEffect(() => {
    if (!recheckKey) return undefined;
    let stale = false;
    PostRepository.getPostByIds(recheckKey.split(','))
      .then(({ data: fresh }) => {
        if (stale || !fresh?.length) return;
        showChildren(mergeFreshChildren(loadedChildrenRef.current, fresh));
      })
      // Left as they are: the next feed update tries again.
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [recheckKey, globalFeedPosts, feedPosts, detailPost, showChildren]);

  function onClickImage(index: number): void {
    viewerIndexRef.current = index;
    setIsVisibleFullImage(true);
    setImageIndex(index);
  }

  function closeFullScreen(): void {
    setIsVisibleFullImage(false);
    mediaControlsRef.current?.slideTo(viewerIndexRef.current);
  }

  // UC2: video carousel opens the swipeable full-screen player
  // (autoplay + mute-carry) instead of the single-video route.
  function openVideoViewer(index: number): void {
    viewerIndexRef.current = index;
    setVideoViewerIndex(index);
  }

  function closeVideoViewer(lastIndex: number): void {
    setVideoViewerIndex(null);
    // Published post: return to the last-viewed frame.
    mediaControlsRef.current?.slideTo(lastIndex);
  }

  const videoViewerItems: MediaViewerItem[] = videoPosts.map(
    (item: IVideoPost) => ({
      type: 'video',
      // The /files/{original}/download endpoint returns the original video
      // file (mp4), not an HLS playlist — no m3u8 type hint (let the player
      // detect the container).
      uri: `https://api.${apiRegion}.amity.co/api/v3/files/${item?.videoFileId?.original}/download`,
    })
  );

  function renderImageHeader({ imageIndex: imgIndex }) {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.flexWidth}>
          <TouchableOpacity
            style={styles.closebtnIcon}
            onPress={closeFullScreen}
          >
            <SvgXml xml={clearIcon('white')} width={28} height={28} />
          </TouchableOpacity>
        </View>
        <View style={styles.flexWidth}>
          <Text style={styles.header}>
            {imgIndex + 1}/
            {imagePostsFullSize.length || videoPostsFullSize.length}
          </Text>
        </View>
        <View style={styles.flexWidth} />
      </View>
    );
  }

  return (
    <Fragment>
      {livestreamId.length <= 0 && (
        <Pressable onPress={onPressPost}>
          {textPost && childrenPosts?.length === 0 && (
            <LinkPreview
              text={textPost}
              mentionPositionArr={[...mentionPositionArr]}
            />
          )}
          {textPost && childrenPosts?.length > 0 && (
            <RenderTextWithMention
              textPost={textPost}
              mentionPositionArr={[...mentionPositionArr]}
            />
          )}
        </Pressable>
      )}
      {pollIds.length > 0 ? (
        <PollContent
          post={post}
          pollId={pollIds[0].pollId}
          disabledPoll={disabledPoll}
          showedAllOptions={showedAllOptions}
        />
      ) : livestreamId.length > 0 ? (
        <LivestreamContent
          post={post}
          onPressPost={onPressPost}
          roomId={livestreamId[0]}
        />
      ) : (
        <PostMediaElement
          posts={mediaChildPosts}
          onImageClick={onClickImage}
          onVideoClick={openVideoViewer}
          controlsRef={mediaControlsRef}
          loading={mediaLoading}
        />
      )}
      <ImageView
        images={
          imagePostsFullSize.length > 0
            ? imagePostsFullSize
            : videoPostsFullSize
        }
        imageIndex={imageIndex}
        visible={visibleFullImage}
        onRequestClose={closeFullScreen}
        onImageIndexChange={(idx: number) => {
          viewerIndexRef.current = idx;
        }}
        isVideoButton={videoPosts.length > 0 ? true : false}
        videoPosts={videoPosts}
        HeaderComponent={renderImageHeader}
      />
      <MediaViewer
        visible={videoViewerIndex !== null}
        items={videoViewerItems}
        initialIndex={videoViewerIndex ?? 0}
        onClose={closeVideoViewer}
      />
    </Fragment>
  );
};

export default memo(PostContent);
