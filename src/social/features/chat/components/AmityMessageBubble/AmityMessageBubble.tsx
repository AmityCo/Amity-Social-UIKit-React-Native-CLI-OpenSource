// AmityMessageBubble — ported from AmityUiKitWeb features/shared/components/MessageBubble.
// Dispatches on message.dataType: a deleted message renders the deleted text; otherwise
// text / image / video each render their own bubble. Image + video resolve their file via
// useFile (image) / useVideoFileUrl (raw video url), show an upload overlay while a local
// preview is pending, and surface tap → open-in-viewer callbacks the parent wires up.
// Long-press surfaces the message action menu. (See-more / mentions / link-preview and
// the moderation "failed" caption remain out of scope for this media task.)

// 1. React / RN imports
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

// 2. Third-party imports
import Video from 'react-native-video';

// 3. Internal imports
import useFile from '../../../../../core/hooks/useFile';
import { ImageSizeState } from '../../../../../core/enums';
import { Loader } from '../../../../../core/design/atoms/Loader';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import { MediaUploadOverlay } from '../../elements/MediaUploadOverlay';
import { useVideoFileUrl } from '../../hooks/useVideoFileUrl';
import { useStyles } from './styles';

// 4. Types
type AmityMessageBubbleProps = {
  message: Amity.Message;
  isUser: boolean;
  onLongPress?: (message: Amity.Message) => void;
  /** Open the full-size image viewer. Wired by the parent. */
  onOpenImage?: (url: string, message: Amity.Message) => void;
  /** Open the full-screen video player. Wired by the parent. */
  onOpenVideo?: (message: Amity.Message) => void;
  /** Local file uri shown optimistically while the media uploads. */
  localPreviewUrl?: string;
  /** Cancel an in-flight upload (shown on the upload overlay). */
  onCancelUpload?: () => void;
};

function getFileId(message: Amity.Message): string {
  return (
    (message.data as { fileId?: string } | undefined)?.fileId ??
    (message as unknown as { fileId?: string }).fileId ??
    ''
  );
}

function isErrorState(message: Amity.Message): boolean {
  return message.syncState === ('error' as Amity.SyncState);
}

// 5. Named function component (dispatcher)
export function AmityMessageBubble({
  message,
  isUser,
  onLongPress,
  onOpenImage,
  onOpenVideo,
  localPreviewUrl,
  onCancelUpload,
}: AmityMessageBubbleProps) {
  if (message.isDeleted) {
    return <TextBubble message={message} isUser={isUser} />;
  }

  switch (message.dataType) {
    case 'image':
      return (
        <ImageBubble
          message={message}
          onOpenImage={onOpenImage}
          onLongPress={onLongPress}
          localPreviewUrl={localPreviewUrl}
          onCancelUpload={onCancelUpload}
        />
      );
    case 'video':
      return (
        <VideoBubble
          message={message}
          onOpenVideo={onOpenVideo}
          onLongPress={onLongPress}
          localPreviewUrl={localPreviewUrl}
          onCancelUpload={onCancelUpload}
        />
      );
    default:
      return (
        <TextBubble
          message={message}
          isUser={isUser}
          onLongPress={onLongPress}
        />
      );
  }
}

// ---------- Text ----------
type TextBubbleProps = {
  message: Amity.Message;
  isUser: boolean;
  onLongPress?: (message: Amity.Message) => void;
};

function TextBubble({ message, isUser, onLongPress }: TextBubbleProps) {
  const { styles } = useStyles();
  const [pressed, setPressed] = useState(false);
  const deletedLabel = useString('amity_chat_message_deleted');

  const text = message.isDeleted
    ? deletedLabel
    : (message.data as { text?: string })?.text ?? '';

  const bubbleStyle = [
    styles.bubble,
    isUser ? styles.bubbleOwn : styles.bubbleOther,
    pressed && (isUser ? styles.bubbleOwnPressed : styles.bubbleOtherPressed),
  ];
  const textStyle = [
    styles.text,
    isUser ? styles.textOwn : styles.textOther,
    message.isDeleted && styles.deletedText,
  ];

  return (
    <Pressable
      style={bubbleStyle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onLongPress={
        message.isDeleted || !onLongPress
          ? undefined
          : () => onLongPress(message)
      }
      disabled={message.isDeleted}
    >
      <View>
        <Text style={textStyle}>{text}</Text>
      </View>
    </Pressable>
  );
}

// ---------- Image ----------
type ImageBubbleProps = {
  message: Amity.Message;
  onOpenImage?: (url: string, message: Amity.Message) => void;
  onLongPress?: (message: Amity.Message) => void;
  localPreviewUrl?: string;
  onCancelUpload?: () => void;
};

function ImageBubble({
  message,
  onOpenImage,
  onLongPress,
  localPreviewUrl,
  onCancelUpload,
}: ImageBubbleProps) {
  const { styles } = useStyles();
  const fileId = getFileId(message);
  const mediumUrl = useFile({ fileId, imageSize: ImageSizeState.medium });
  const largeUrl = useFile({ fileId, imageSize: ImageSizeState.large });
  const [pressed, setPressed] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const isFailed = isErrorState(message);
  const displaySrc = localPreviewUrl ?? mediumUrl;
  const openUrl = largeUrl ?? mediumUrl;

  if (!displaySrc) {
    return (
      <View style={styles.mediaPlaceholder}>
        <Loader.Upload size="medium" />
      </View>
    );
  }

  if (hasLoadError && !localPreviewUrl) {
    return (
      <View style={styles.mediaBroken} accessibilityLabel="Image unavailable">
        <AmityIcon
          name="image-slash-r"
          size={40}
          tokenColor={AmityColorToken.IconMediaImageBroken}
        />
      </View>
    );
  }

  const showUploadOverlay = !!localPreviewUrl && !isFailed;
  const canOpen = !!onOpenImage && !!openUrl && !isFailed && !localPreviewUrl;

  return (
    <Pressable
      style={styles.imageBubble}
      accessibilityRole="button"
      accessibilityLabel="Open image"
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={canOpen ? () => onOpenImage!(openUrl!, message) : undefined}
      onLongPress={
        isFailed || !!localPreviewUrl || !onLongPress
          ? undefined
          : () => onLongPress(message)
      }
    >
      <Image
        source={{ uri: displaySrc }}
        style={styles.mediaImage}
        resizeMode="cover"
        onError={() => setHasLoadError(true)}
      />
      {showUploadOverlay ? (
        <MediaUploadOverlay onCancel={onCancelUpload} />
      ) : null}
      {pressed ? <View style={styles.mediaPressedScrim} /> : null}
    </Pressable>
  );
}

// ---------- Video ----------
type VideoBubbleProps = {
  message: Amity.Message;
  onOpenVideo?: (message: Amity.Message) => void;
  onLongPress?: (message: Amity.Message) => void;
  localPreviewUrl?: string;
  onCancelUpload?: () => void;
};

function VideoBubble({
  message,
  onOpenVideo,
  onLongPress,
  localPreviewUrl,
  onCancelUpload,
}: VideoBubbleProps) {
  const { styles } = useStyles();
  const fileId = getFileId(message);
  const videoUrl = useVideoFileUrl(fileId);
  const [pressed, setPressed] = useState(false);

  const isFailed = isErrorState(message);
  const thumbnailUri = localPreviewUrl ?? videoUrl;

  if (!thumbnailUri) {
    return (
      <View style={styles.mediaPlaceholder}>
        <Loader.Upload size="medium" />
      </View>
    );
  }

  const showUploadOverlay = !!localPreviewUrl && !isFailed;
  const canOpen = !!onOpenVideo && !isFailed && !localPreviewUrl;

  return (
    <Pressable
      style={styles.videoBubble}
      accessibilityRole="button"
      accessibilityLabel="Play video"
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={canOpen ? () => onOpenVideo!(message) : undefined}
      onLongPress={
        isFailed || !!localPreviewUrl || !onLongPress
          ? undefined
          : () => onLongPress(message)
      }
    >
      <Video
        source={{ uri: thumbnailUri }}
        style={styles.mediaImage}
        resizeMode="cover"
        paused
        muted
        controls={false}
      />
      {showUploadOverlay ? (
        <MediaUploadOverlay onCancel={onCancelUpload} />
      ) : (
        <View style={styles.videoPlayChip} pointerEvents="none">
          <AmityIcon
            name="video-play-s"
            size={24}
            tokenColor={AmityColorToken.IconIconButtonTransparentPrimaryDefault}
          />
        </View>
      )}
      {pressed ? <View style={styles.mediaPressedScrim} /> : null}
    </Pressable>
  );
}
