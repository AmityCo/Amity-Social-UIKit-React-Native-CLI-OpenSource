import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from './styles';
import useAuth from '../../../core/hooks/useAuth';
import { IVideoPost, MediaUri } from '../legacy/Social/PostList';
import { getPostById } from '../../../core/legacy/feed';
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
  const { currentPostdetail } = useUIKitSelector(
    (state: RootState) => state.postDetail
  );
  const { postList: postListGlobal } = useUIKitSelector(
    (state: RootState) => state.globalFeed
  );
  const { postList } = useUIKitSelector((state: RootState) => state.feed);

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

  const getPostInfo = useCallback(async () => {
    setMediaLoading((childrenPosts?.length ?? 0) > 0);
    try {
      const response = await Promise.all(
        childrenPosts.map(async (id) => {
          const { data: childrenPost } = await getPostById(id);
          return {
            post: childrenPost,
            dataType: childrenPost?.dataType,
            data: childrenPost?.data,
          };
        })
      );

      const images: string[] = [];
      const videos: IVideoPost[] = [];
      const polls: { pollId: string }[] = [];
      const livestreams: Amity.Room['roomId'][] = [];
      const media: Amity.Post[] = [];

      response.forEach((item) => {
        if (item?.dataType === 'image' && item?.data?.fileId) {
          const url: string = `https://api.${apiRegion}.amity.co/api/v3/files/${item?.data.fileId}/download?size=medium`;
          if (!images.includes(url)) {
            images.push(url);
            if (item.post) media.push(item.post);
          }
        } else if (
          item?.dataType === 'video' &&
          item?.data?.videoFileId.original
        ) {
          const isExisted = videos.some(
            (video) =>
              video.videoFileId.original === item.data.videoFileId.original
          );
          if (!isExisted) {
            videos.push(item.data);
            if (item.post) media.push(item.post);
          }
        } else if (item?.dataType === 'poll') {
          if (!polls.some((poll) => poll.pollId === item.data.pollId)) {
            polls.push(item.data);
          }
        } else if (item?.dataType === 'room') {
          if (!livestreams.includes(item.data.roomId)) {
            livestreams.push(item.data.roomId);
          }
        }
      });

      // Set unconditionally so navigating to a post without media clears the
      // previous media (see the effect below which no longer eagerly resets).
      setMediaChildPosts(media);
      setImagePosts(images);
      setVideoPosts(videos);
      if (polls.length > 0) {
        setPollIds(polls);
      }
      if (livestreams.length > 0) {
        setLivestreamId(livestreams);
      }
    } catch (error) {
      console.log('error: ', error);
    } finally {
      setMediaLoading(false);
    }
  }, [apiRegion, childrenPosts]);

  useEffect(() => {
    // Don't clear media here: getPostInfo resolves images/videos/media to their
    // fresh values, so the existing media stays on screen until the new data
    // arrives. Eagerly resetting caused a blank flash whenever the feed
    // re-rendered (e.g. realtime updates), then the content popped back in.
    getPostInfo();
  }, [childrenPosts, currentPostdetail, postList, postListGlobal, getPostInfo]);

  function onClickImage(index: number): void {
    viewerIndexRef.current = index;
    setIsVisibleFullImage(true);
    setImageIndex(index);
  }

  function closeFullScreen(): void {
    setIsVisibleFullImage(false);
    mediaControlsRef.current?.slideTo(viewerIndexRef.current);
  }

  // UC2 (PDT-4309): video carousel opens the swipeable full-screen player
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
