// MessageReplyQuote — ported from AmityUiKitWeb features/shared/components/
// MessageReplyQuote. The quoted parent message rendered above a reply bubble:
// a "replied to" header plus a tappable snapshot of the parent (text / image /
// video / custom / deleted). Web fetched the parent via useMessageObject; RN has
// no such hook, so the resolved `parent` (and optional `isLoading`) are passed in
// by the wiring layer. Media dimensions are clamped via getReplyThumbnailSize.

// 1. React / RN imports
import { useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type ImageLoadEventData,
  type StyleProp,
  type TextStyle,
} from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import { Loader } from '../../../../../../../core/design/atoms/Loader';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import useFile from '../../../../../../../core/hooks/useFile';
import { ImageSizeState } from '../../../../../../../core/enums';
import { useString } from '../../../../../../../core/localization';
import { getReplyHeader, getReplyThumbnailSize } from './utils';
import { useStyles } from './styles';

// 3. Types
type MessageReplyQuoteProps = {
  parent?: Amity.Message | null;
  child: Amity.Message;
  isUser: boolean;
  isGroupChat: boolean;
  currentUserId?: string | null;
  isLoading?: boolean;
  onOpenSeeMore: (text: string, title?: string) => void;
  onOpenImage: (url: string, message: Amity.Message) => void;
  onOpenVideo: (message: Amity.Message) => void;
};

type MessageData = {
  text?: string;
  fileId?: string;
  thumbnailFileId?: string;
};

// Ported from web's <Linkify> in TextQuote: URLs are recoloured (inbound-link
// token) + underlined but NOT separately tappable — the whole quote is the tap
// target (onOpenSeeMore). Splits the text into plain strings + styled link spans.
const URL_SPLIT_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function renderQuoteTextWithLinks(
  text: string,
  linkStyle: StyleProp<TextStyle>
): ReactNode[] {
  const out: ReactNode[] = [];
  text.split(URL_SPLIT_RE).forEach((part, i) => {
    if (!part) return;
    if (/^(?:https?:\/\/|www\.)/i.test(part)) {
      out.push(
        <Text key={`l-${i}`} style={linkStyle}>
          {part}
        </Text>
      );
    } else {
      out.push(part);
    }
  });
  return out;
}

// 4. Named function component
export function MessageReplyQuote({
  parent,
  child,
  isUser,
  isGroupChat,
  currentUserId,
  isLoading,
  onOpenSeeMore,
  onOpenImage,
  onOpenVideo,
}: MessageReplyQuoteProps) {
  const { styles, headerIconColor } = useStyles(isUser);

  if (isLoading || !parent) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder} accessibilityState={{ busy: true }}>
          <Loader.Spinner size="sm" />
        </View>
      </View>
    );
  }

  const headerText = getReplyHeader({
    child,
    parent,
    currentUserId,
    isGroupChat,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* QA directive: the "replied to" quote icon in the bubble is SOLID
            (deviates from web develop's Regular <ShareLeft/> — the action-menu
            reply option stays Regular). */}
        <AmityIcon name="share-left-s" size={16} tokenColor={headerIconColor} />
        <Typography
          variant="caption"
          style={styles.headerText}
          numberOfLines={1}
        >
          {headerText}
        </Typography>
      </View>
      <ParentBody
        parent={parent}
        isUser={isUser}
        onOpenSeeMore={onOpenSeeMore}
        onOpenImage={onOpenImage}
        onOpenVideo={onOpenVideo}
      />
    </View>
  );
}

type ParentBodyProps = {
  parent: Amity.Message;
  isUser: boolean;
  onOpenSeeMore: (text: string, title?: string) => void;
  onOpenImage: (url: string, message: Amity.Message) => void;
  onOpenVideo: (message: Amity.Message) => void;
};

function ParentBody({
  parent,
  isUser,
  onOpenSeeMore,
  onOpenImage,
  onOpenVideo,
}: ParentBodyProps) {
  if (parent.isDeleted) {
    return <DeletedQuote isUser={isUser} />;
  }
  switch (parent.dataType) {
    case 'text':
      return (
        <TextQuote
          parent={parent}
          isUser={isUser}
          onOpenSeeMore={onOpenSeeMore}
        />
      );
    case 'custom':
      return <CustomQuote parent={parent} isUser={isUser} />;
    case 'image':
      return (
        <ImageQuote parent={parent} isUser={isUser} onOpenImage={onOpenImage} />
      );
    case 'video':
      return (
        <VideoQuote parent={parent} isUser={isUser} onOpenVideo={onOpenVideo} />
      );
    default:
      return null;
  }
}

function DeletedQuote({ isUser }: { isUser: boolean }) {
  const { styles } = useStyles(isUser);
  const deletedLabel = useString('amity_chat_message_deleted');
  return (
    <View style={styles.quote}>
      <View style={styles.deletedBubble}>
        <AmityIcon
          name="trash-r"
          size={16}
          tokenColor={AmityColorToken.IconChatBubbleInboundMessagesDeleted}
        />
        <Typography variant="caption" style={styles.deletedText}>
          {deletedLabel}
        </Typography>
      </View>
      <View style={styles.overlay} pointerEvents="none" />
    </View>
  );
}

function TextQuote({
  parent,
  isUser,
  onOpenSeeMore,
}: {
  parent: Amity.Message;
  isUser: boolean;
  onOpenSeeMore: (text: string, title?: string) => void;
}) {
  const { styles } = useStyles(isUser);
  const text = (
    (parent.data as MessageData | undefined)?.text ?? ''
  ).toString();
  const repliedMessageTitle = useString('amity_chat_message_replied_message');
  return (
    <Pressable
      style={styles.quote}
      accessibilityRole="button"
      accessibilityLabel={repliedMessageTitle}
      onPress={() => onOpenSeeMore(text, repliedMessageTitle)}
    >
      <View style={styles.textBubble}>
        <Typography variant="body" style={styles.text} numberOfLines={2}>
          {renderQuoteTextWithLinks(text, styles.link)}
        </Typography>
      </View>
      <View style={styles.overlay} pointerEvents="none" />
    </Pressable>
  );
}

function CustomQuote({
  parent,
  isUser,
}: {
  parent: Amity.Message;
  isUser: boolean;
}) {
  const { styles } = useStyles(isUser);
  const text = JSON.stringify(parent.data ?? {});
  return (
    <View style={styles.quote}>
      <View style={styles.textBubble}>
        <Typography variant="body" style={styles.text} numberOfLines={2}>
          {text}
        </Typography>
      </View>
      <View style={styles.overlay} pointerEvents="none" />
    </View>
  );
}

function ImageQuote({
  parent,
  isUser,
  onOpenImage,
}: {
  parent: Amity.Message;
  isUser: boolean;
  onOpenImage: (url: string, message: Amity.Message) => void;
}) {
  const { styles } = useStyles(isUser);
  const fileId = (parent.data as MessageData | undefined)?.fileId ?? '';
  const mediumUrl = useFile({ fileId, imageSize: ImageSizeState.medium });
  const largeUrl = useFile({ fileId, imageSize: ImageSizeState.large });
  const [size, setSize] = useState({ width: 120, height: 120 });
  const [hasError, setHasError] = useState(false);

  const boxStyle = { width: size.width, height: size.height };

  if (!mediumUrl) {
    return (
      <View
        style={[styles.mediaBox, styles.mediaBoxLoading, boxStyle]}
        accessibilityState={{ busy: true }}
      >
        <Loader.Spinner size="sm" />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.mediaBox, styles.mediaBoxBroken, boxStyle]}>
        <AmityIcon
          name="image-slash-r"
          size={24}
          tokenColor={AmityColorToken.IconMediaImageBroken}
        />
      </View>
    );
  }

  function handleLoad(event: { nativeEvent: ImageLoadEventData }) {
    const { width, height } = event.nativeEvent.source;
    const next = getReplyThumbnailSize(width, height);
    setSize({ width: next.widthRem * 16, height: next.heightRem * 16 });
  }

  return (
    <Pressable
      style={styles.quote}
      accessibilityRole="button"
      onPress={() => onOpenImage(largeUrl || mediumUrl, parent)}
    >
      <Image
        source={{ uri: mediumUrl }}
        style={[styles.media, boxStyle]}
        resizeMode="cover"
        onError={() => setHasError(true)}
        onLoad={handleLoad}
      />
      <View style={styles.overlay} pointerEvents="none" />
    </Pressable>
  );
}

function VideoQuote({
  parent,
  isUser,
  onOpenVideo,
}: {
  parent: Amity.Message;
  isUser: boolean;
  onOpenVideo: (message: Amity.Message) => void;
}) {
  const { styles } = useStyles(isUser);
  const thumbFileId =
    (parent.data as MessageData | undefined)?.thumbnailFileId ?? '';
  const thumbUrl = useFile({
    fileId: thumbFileId,
    imageSize: ImageSizeState.medium,
  });
  const [size, setSize] = useState({ width: 120, height: 120 });

  const boxStyle = { width: size.width, height: size.height };

  if (!thumbUrl) {
    return (
      <View
        style={[styles.mediaBox, styles.mediaBoxLoading, boxStyle]}
        accessibilityState={{ busy: true }}
      >
        <Loader.Spinner size="sm" />
      </View>
    );
  }

  function handleLoad(event: { nativeEvent: ImageLoadEventData }) {
    const { width, height } = event.nativeEvent.source;
    const next = getReplyThumbnailSize(width, height);
    setSize({ width: next.widthRem * 16, height: next.heightRem * 16 });
  }

  return (
    <Pressable
      style={styles.quote}
      accessibilityRole="button"
      onPress={() => onOpenVideo(parent)}
    >
      <Image
        source={{ uri: thumbUrl }}
        style={[styles.media, boxStyle]}
        resizeMode="cover"
        onLoad={handleLoad}
      />
      <View style={styles.overlay} pointerEvents="none" />
      <View style={styles.playChip} pointerEvents="none">
        <AmityIcon
          name="video-play-s"
          size={24}
          tokenColor={AmityColorToken.IconIconButtonTransparentPrimaryDefault}
        />
      </View>
    </Pressable>
  );
}
