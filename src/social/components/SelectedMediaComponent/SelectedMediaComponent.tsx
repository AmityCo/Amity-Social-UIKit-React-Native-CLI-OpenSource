import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { createVideoThumbnail } from 'react-native-compressor';
import LoadingImage from '../LoadingImage';
import LoadingVideo from '../LoadingVideo';
import { MediaViewer, type MediaViewerItem } from '../MediaViewer';
import { IDisplayImage } from '../../../core/types';
import {
  getFrameRatio,
  getVideoDisplayDims,
  FRAME_RATIO_VALUE,
  DEFAULT_FRAME_RATIO,
  type FrameRatio,
} from '../../utils/getFrameRatio';
import { useStyles } from './styles';

// Peek scroll: next slide peeks by (PEEK_INSET − SPACE_BETWEEN). The composer
// body (PostComposer `inputWrapper`) already insets everything 12px
// horizontally, so this component adds NO side padding of its own — it only
// sizes the slide so the peek lands at the spec's 31px (SelectedMediaComponent
// REQ-003a). slideWidth = trackWidth − PEEK_INSET; peek = PEEK_INSET − 8 = 31.
const PEEK_INSET = 39;
const SPACE_BETWEEN = 8;

export type SelectedMediaComponentProps = {
  mediaType: 'image' | 'video';
  media: IDisplayImage[];
  onClose?: (originalPath: string, fileId?: string, postId?: string) => void;
  onLoadFinish?: (
    fileId: string,
    fileUrl: string,
    fileName: string,
    index: number,
    originalPath: string,
    thumbnail?: string
  ) => void;
  onUploadError?: (hasError: boolean, source: string) => void;
  isEditMode?: boolean;
  setIsUploading?: (arg: boolean) => void;
};

export function SelectedMediaComponent({
  mediaType,
  media,
  onClose,
  onLoadFinish,
  onUploadError,
  isEditMode = false,
  setIsUploading,
}: SelectedMediaComponentProps) {
  const styles = useStyles();
  const scrollRef = useRef<ScrollView>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [ratio, setRatio] = useState<FrameRatio>(DEFAULT_FRAME_RATIO);
  // Index of the frame the full-screen viewer was opened from (null = closed).
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const total = media.length;
  const isCarousel = total > 1;
  const aspectRatio = FRAME_RATIO_VALUE[ratio];
  const slideWidth = trackWidth > 0 ? trackWidth - PEEK_INSET : 0;

  // Frames follow the aspect ratio classified from the item currently in first
  // position (REQ-003d/003e); recalculated when the first item changes.
  const first = media[0];
  const firstUrl = first?.url;
  const firstWidth = first?.width;
  const firstHeight = first?.height;
  const firstRotation = first?.rotation;
  useEffect(() => {
    if (!firstUrl) {
      setRatio(DEFAULT_FRAME_RATIO);
      return undefined;
    }
    // Video: classify from the record/extractor dims, applying rotation
    // (REQ-003d1 — MUST NOT silently fall back to 1:1 for video). Shares the
    // one rotation derivation with the published carousel (REQ-SDK-002b).
    if (mediaType === 'video') {
      if (firstWidth && firstHeight) {
        const { width, height } = getVideoDisplayDims({
          width: firstWidth,
          height: firstHeight,
          rotation: firstRotation,
        });
        setRatio(getFrameRatio(width, height));
        return undefined;
      }
      // No usable dims — a locally-picked video can arrive with none (the
      // Android extractor reports 0×0 when MediaMetadataRetriever fails, and
      // iOS picks carry none by design, see PostComposer). Measure the
      // generated thumbnail instead of defaulting to a square frame
      // (REQ-003d2, PDT-4904): it is a rendered frame, so its dimensions are
      // already display-oriented and need no rotation applied.
      let active = true;
      createVideoThumbnail(firstUrl)
        .then(({ width, height }) => {
          if (active) setRatio(getFrameRatio(width, height));
        })
        .catch(() => {
          // Log the fallback so a square frame is never silently ambiguous.
          console.log(
            '[SelectedMediaComponent] video has no dimensions; defaulting ratio'
          );
          if (active) setRatio(DEFAULT_FRAME_RATIO);
        });
      return () => {
        active = false;
      };
    }
    // Image: prefer carried dims, else measure the source.
    if (firstWidth && firstHeight) {
      setRatio(getFrameRatio(firstWidth, firstHeight));
      return undefined;
    }
    let active = true;
    Image.getSize(
      firstUrl,
      (width, height) => {
        if (active) setRatio(getFrameRatio(width, height));
      },
      () => {
        if (active) setRatio(DEFAULT_FRAME_RATIO);
      }
    );
    return () => {
      active = false;
    };
  }, [firstUrl, firstWidth, firstHeight, firstRotation, mediaType]);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width && width !== trackWidth) setTrackWidth(width);
  };

  const viewerItems: MediaViewerItem[] = media.map((m) => ({
    type: mediaType,
    uri: m.url,
  }));

  // PDT-4310/4312: on close, return to the frame originally tapped from — not
  // the last frame viewed in full screen.
  const handleCloseViewer = () => {
    const tapped = viewerIndex ?? 0;
    setViewerIndex(null);
    if (isCarousel && slideWidth > 0) {
      scrollRef.current?.scrollTo({
        x: tapped * (slideWidth + SPACE_BETWEEN),
        animated: false,
      });
    }
  };

  const renderFrame = (item: IDisplayImage, index: number) => (
    <View style={[styles.selectedMedia__frame, { aspectRatio }]}>
      {mediaType === 'video' ? (
        <LoadingVideo
          carousel
          source={item.url}
          onClose={onClose}
          index={index}
          onLoadFinish={onLoadFinish}
          onUploadError={onUploadError}
          isUploaded={item.isUploaded}
          fileId={item.fileId}
          thumbNail={item.thumbNail as string}
          fileCount={total}
          isEditMode={isEditMode}
          postId={item.postId}
          setIsUploading={setIsUploading}
          onPlay={() => setViewerIndex(index)}
        />
      ) : (
        <Pressable
          style={styles.selectedMedia__mediaButton}
          onPress={() => setViewerIndex(index)}
        >
          <LoadingImage
            carousel
            source={item.url}
            onClose={onClose}
            index={index}
            onLoadFinish={onLoadFinish}
            onUploadError={onUploadError}
            isUploaded={item.isUploaded}
            fileId={item.fileId}
            fileCount={total}
            isEditMode={isEditMode}
            postId={item.postId}
            setIsUploading={setIsUploading}
          />
        </Pressable>
      )}
    </View>
  );

  if (total === 0) return null;

  return (
    <Fragment>
      {!isCarousel ? (
        <View style={styles.selectedMedia}>
          <View style={styles.selectedMedia__track} onLayout={onLayout}>
            {renderFrame(media[0], 0)}
          </View>
        </View>
      ) : (
        <View style={styles.selectedMedia}>
          <View style={styles.selectedMedia__track} onLayout={onLayout}>
            {slideWidth > 0 && (
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={slideWidth + SPACE_BETWEEN}
                snapToAlignment="start"
              >
                {media.map((item, index) => (
                  <View
                    key={`${item.url}-${index}`}
                    style={[
                      styles.selectedMedia__slide,
                      {
                        width: slideWidth,
                        marginRight: index < total - 1 ? SPACE_BETWEEN : 0,
                      },
                    ]}
                  >
                    {renderFrame(item, index)}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}
      <MediaViewer
        visible={viewerIndex !== null}
        items={viewerItems}
        initialIndex={viewerIndex ?? 0}
        onClose={handleCloseViewer}
      />
    </Fragment>
  );
}
