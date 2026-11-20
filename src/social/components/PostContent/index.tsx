import { Fragment, memo, useMemo, useRef, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from './styles';
import useAuth from '../../../core/hooks/useAuth';
import { IVideoPost, MediaUri } from '../legacy/Social/PostList';
import { usePostByIds } from '../../../core/hooks/usePostByIds';
import ImageView from '../legacy/react-native-image-viewing/dist';
import { SvgXml } from 'react-native-svg';
import { clearIcon } from '../../../core/assets/icons/xml';
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
  classifyPostChildren,
  type ResolvedPostChild,
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
  const [visibleFullImage, setIsVisibleFullImage] = useState<boolean>(false);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [videoViewerIndex, setVideoViewerIndex] = useState<number | null>(null);

  const mediaControlsRef = useRef<PostMediaControls | null>(null);
  const viewerIndexRef = useRef<number>(0);

  const styles = useStyles();

  const { posts: childPosts, isLoading: mediaLoading } =
    usePostByIds(childrenPosts);

  const {
    images: imagePosts,
    videos: videoPosts,
    polls: pollIds,
    livestreams: livestreamId,
    media: mediaChildPosts,
  } = useMemo(
    () =>
      classifyPostChildren(
        childPosts.map((child) => ({
          post: child,
          dataType: child?.dataType,
          data: child?.data as ResolvedPostChild['data'],
        })),
        apiRegion
      ),
    [childPosts, apiRegion]
  );

  const imagePostsFullSize = useMemo<MediaUri[]>(
    () =>
      imagePosts.map((url) => ({
        uri: url.replace('size=medium', 'size=large'),
      })),
    [imagePosts]
  );

  const videoPostsFullSize = useMemo<MediaUri[]>(
    () =>
      videoPosts.map((item: IVideoPost) => ({
        uri: `https://api.${apiRegion}.amity.co/api/v3/files/${item?.thumbnailFileId}/download?size=large`,
      })),
    [videoPosts, apiRegion]
  );

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
