import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import {
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
      {dots.map((dot) => (
        <View key={dot.key} style={styles.postMedia__dotSlot}>
          <View
            style={[
              styles.postMedia__dot,
              dot.state === 'active'
                ? styles.postMedia__dotActive
                : dot.state === 'edge'
                ? styles.postMedia__dotEdge
                : styles.postMedia__dotInactive,
            ]}
          />
        </View>
      ))}
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
  const [isBroken, setIsBroken] = useState(false);
  const fileId = post.getImageInfo()?.fileId;
  const url = fileId
    ? `https://api.${apiRegion}.amity.co/api/v3/files/${fileId}/download?size=large`
    : undefined;

  if (!url || isBroken) return <BrokenFrame />;

  return (
    <Image
      style={styles.postMedia__media as StyleProp<ImageStyle>}
      source={{ uri: url }}
      resizeMode="cover"
      onError={() => setIsBroken(true)}
    />
  );
}

type VideoMediaProps = { post: Amity.Post<'video'> };

function VideoMedia({ post }: VideoMediaProps) {
  const styles = useStyles();
  const { apiRegion } = useAuth();
  const [isBroken, setIsBroken] = useState(false);

  const data = post.data as Amity.ContentDataVideo | undefined;
  const thumbnailFileId = data?.thumbnailFileId;
  const url = thumbnailFileId
    ? `https://api.${apiRegion}.amity.co/api/v3/files/${thumbnailFileId}/download?size=large`
    : undefined;

  if (!url || isBroken) return <BrokenFrame />;

  return (
    <>
      <Image
        style={styles.postMedia__media as StyleProp<ImageStyle>}
        source={{ uri: url }}
        resizeMode="cover"
        onError={() => setIsBroken(true)}
      />
      <View style={styles.postMedia__playButton}>
        <SvgXml xml={videoControlIcon} width="40" height="40" />
      </View>
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
