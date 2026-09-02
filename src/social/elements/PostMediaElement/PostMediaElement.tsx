import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import {
  Animated,
  Image,
  ImageStyle,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleProp,
  useWindowDimensions,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { FileRepository } from '@amityco/ts-sdk-react-native';
import { Typography } from '../../../core/components/Typography/Typography';
import useAuth from '../../../core/hooks/useAuth';
import {
  videoControlIcon,
  brokenImageIcon,
} from '../../../core/assets/icons/xml';
import {
  getFrameRatio,
  getVideoDisplayDims,
  FRAME_RATIO_VALUE,
  DEFAULT_FRAME_RATIO,
  type FrameRatio,
} from '../../utils/getFrameRatio';
import { getIndicatorConfig } from '../../utils/getIndicatorConfig';
import { ImageSizeState } from '../../enums/imageSizeState';
import { useUIKitSelector } from '../../../core/stores/store';
import type { RootState } from '../../../core/stores/store';
import { useStyles } from './styles';

type MediaPost = Amity.Post<'image'> | Amity.Post<'video'>;

function isMediaPost(post: Amity.Post): post is MediaPost {
  return post.dataType === 'image' || post.dataType === 'video';
}

function getAttachmentRatio(post?: MediaPost): FrameRatio {
  if (!post) return DEFAULT_FRAME_RATIO;

  if (post.dataType === 'image') {
    const image = post.getImageInfo();
    return getFrameRatio(image?.getWidth(), image?.getHeight());
  }

  const video = post.getVideoInfo();
  const { width, height } = getVideoDisplayDims({
    width: video?.getWidth(),
    height: video?.getHeight(),
    rotation: video?.getRotation(),
  });
  return getFrameRatio(width, height);
}

export type PostMediaControls = {
  slideTo: (index: number) => void;
};

export type PostMediaElementProps = {
  posts: Amity.Post[];
  onImageClick: (index: number) => void;
  onVideoClick: (index: number) => void;
  controlsRef?: MutableRefObject<PostMediaControls | null>;
  /** While the post's media children are still being fetched, show a
   * placeholder frame instead of nothing (avoids a blank → pop). */
  loading?: boolean;
};

export function PostMediaElement({
  posts,
  onImageClick,
  onVideoClick,
  controlsRef,
  loading = false,
}: PostMediaElementProps) {
  const styles = useStyles();
  const { width: screenWidth } = useWindowDimensions();
  const [current, setCurrent] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const mediaPosts = useMemo(() => (posts ?? []).filter(isMediaPost), [posts]);
  const ratio = useMemo(() => getAttachmentRatio(mediaPosts[0]), [mediaPosts]);

  if (mediaPosts.length === 0) {
    if (!loading) return null;
    // Loading placeholder: a full-bleed frame in the base-shade4 colour, so the
    // media area doesn't flash blank before the child posts resolve.
    return (
      <View style={styles.postMedia}>
        <View style={styles.postMedia__track}>
          <View
            style={[
              styles.postMedia__frame,
              { aspectRatio: FRAME_RATIO_VALUE[DEFAULT_FRAME_RATIO] },
            ]}
          />
        </View>
      </View>
    );
  }

  const total = mediaPosts.length;
  const isCarousel = total > 1;
  const aspectRatio = FRAME_RATIO_VALUE[ratio];
  // The carousel is full-bleed (screen width); use that immediately so the
  // ScrollView renders without waiting for onLayout — otherwise there is an
  // empty block between the placeholder and the first frame.
  const slideWidth = trackWidth || screenWidth;

  const handleFrameClick = (index: number) => {
    const post = mediaPosts[index];
    if (post.dataType === 'image') onImageClick(index);
    else onVideoClick(index);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width && width !== trackWidth) setTrackWidth(width);
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (!slideWidth) return;
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / slideWidth
    );
    if (nextIndex !== current) setCurrent(nextIndex);
  };

  if (controlsRef) {
    controlsRef.current = {
      slideTo: (index: number) => {
        scrollRef.current?.scrollTo({
          x: index * slideWidth,
          animated: false,
        });
        setCurrent(index);
      },
    };
  }

  if (!isCarousel) {
    return (
      <View style={styles.postMedia}>
        <View style={styles.postMedia__track} onLayout={onLayout}>
          <MediaFrame
            post={mediaPosts[0]}
            aspectRatio={aspectRatio}
            onPress={() => handleFrameClick(0)}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.postMedia}>
      <View style={styles.postMedia__track} onLayout={onLayout}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          {mediaPosts.map((post, index) => (
            <View
              key={post.postId}
              style={[styles.postMedia__slide, { width: slideWidth }]}
            >
              <MediaFrame
                post={post}
                aspectRatio={aspectRatio}
                onPress={() => handleFrameClick(index)}
              />
            </View>
          ))}
        </ScrollView>
        <PositionCounter current={current} total={total} />
      </View>
      <PaginationIndicator current={current} total={total} />
    </View>
  );
}

type PaginationIndicatorProps = {
  current: number;
  total: number;
};

function PaginationIndicator({ current, total }: PaginationIndicatorProps) {
  const styles = useStyles();
  const { dots } = getIndicatorConfig(current, total);

  return (
    <View style={styles.postMedia__indicator}>
      {dots.map((dot) =>
        dot.state === 'edge' ? (
          <EdgeDot key={dot.key} side={dot.side} />
        ) : (
          <View key={dot.key} style={styles.postMedia__dotSlot}>
            <View
              style={[
                styles.postMedia__dot,
                dot.state === 'active'
                  ? styles.postMedia__dotActive
                  : styles.postMedia__dotInactive,
              ]}
            />
          </View>
        )
      )}
    </View>
  );
}

// The strip keeps a constant width (fixed-width slots, always 6 elements), so
// an edge dot only needs to slide in from its own side over 300ms when it
// first appears (REQ-013b).
function EdgeDot({ side }: { side?: 'left' | 'right' }) {
  const styles = useStyles();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [side === 'left' ? -6 : 6, 0],
  });

  return (
    <View style={styles.postMedia__dotSlot}>
      <Animated.View
        style={[
          styles.postMedia__dot,
          styles.postMedia__dotEdge,
          { opacity: anim, transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

type PositionCounterProps = {
  current: number;
  total: number;
};

function PositionCounter({ current, total }: PositionCounterProps) {
  const styles = useStyles();

  return (
    <View style={styles.postMedia__counter}>
      <Typography.Body style={styles.postMedia__counterLabel}>
        {current + 1}/{total}
      </Typography.Body>
    </View>
  );
}

type MediaFrameProps = {
  post: MediaPost;
  aspectRatio: number;
  onPress: () => void;
};

function MediaFrame({ post, aspectRatio, onPress }: MediaFrameProps) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.postMedia__frame, { aspectRatio }]}
    >
      {post.dataType === 'image' ? (
        <ImageMedia post={post as Amity.Post<'image'>} />
      ) : (
        <VideoMedia post={post as Amity.Post<'video'>} />
      )}
    </Pressable>
  );
}

type ImageMediaProps = { post: Amity.Post<'image'> };

function ImageMedia({ post }: ImageMediaProps) {
  const styles = useStyles();
  const { apiRegion } = useAuth();
  const fileId = post.getImageInfo()?.fileId;
  const url = fileId
    ? `https://api.${apiRegion}.amity.co/api/v3/files/${fileId}/download?size=large`
    : undefined;
  // Keyed to the url rather than a bare boolean, so replacing the image retries
  // the load instead of staying broken for the session (see VideoMedia).
  const [brokenUrl, setBrokenUrl] = useState<string>();

  if (!url || brokenUrl === url) return <BrokenFrame />;

  return (
    <Image
      style={styles.postMedia__media as StyleProp<ImageStyle>}
      source={{ uri: url }}
      resizeMode="cover"
      onError={() => setBrokenUrl(url)}
    />
  );
}

type VideoMediaProps = { post: Amity.Post<'video'> };

function VideoMedia({ post }: VideoMediaProps) {
  const styles = useStyles();

  // Resolve the thumbnail through the SDK's linked file object rather than
  // building a download url from `data.thumbnailFileId`. The file behind that
  // id does not exist until the server finishes transcoding, so a url built
  // from the id alone is well-formed and still 404s — which is what rendered a
  // broken-image icon on every just-created video post. The file object is the
  // honest signal: it is absent until the thumbnail actually exists. Mirrors
  // web's useImage/useFile.
  const thumbnail = post.getVideoThumbnailInfo?.();
  const serverUrl = thumbnail?.fileUrl
    ? FileRepository.fileUrlWithSize(thumbnail.fileUrl, ImageSizeState.large)
    : undefined;

  // While the server has none, borrow the frame the composer decoded when this
  // video was picked, matched on the original video's fileId (web parity:
  // VideoContent falls back to LayoutProvider's videoThumbnail the same way).
  const localThumbnails = useUIKitSelector(
    (state: RootState) => state.localVideoThumbnail.videos
  );
  const originalFileId = (post.data as Amity.ContentDataVideo | undefined)
    ?.videoFileId?.original;
  const localUrl = serverUrl
    ? undefined
    : localThumbnails.find(({ fileId }) => fileId === originalFileId)
        ?.thumbnailUrl;

  const url = serverUrl ?? localUrl;

  // Keyed to the url, not a bare boolean: the url changes when the real
  // thumbnail lands, and a latched flag would keep the frame broken for the
  // rest of the session.
  const [brokenUrl, setBrokenUrl] = useState<string>();

  const playButton = (
    <View style={styles.postMedia__playButton}>
      <SvgXml xml={videoControlIcon} width="40" height="40" />
    </View>
  );

  // Nothing to show yet, from either source: still a normal state for a new
  // post, so keep the play affordance rather than flagging it broken.
  if (!url) return <View style={styles.postMedia__pending}>{playButton}</View>;

  if (brokenUrl === url) return <BrokenFrame />;

  return (
    <>
      <Image
        style={styles.postMedia__media as StyleProp<ImageStyle>}
        source={{ uri: url }}
        resizeMode="cover"
        onError={() => setBrokenUrl(url)}
      />
      {playButton}
    </>
  );
}

function BrokenFrame() {
  const styles = useStyles();
  return (
    <View style={styles.postMedia__broken}>
      <SvgXml xml={brokenImageIcon()} width={32} height={32} />
    </View>
  );
}
