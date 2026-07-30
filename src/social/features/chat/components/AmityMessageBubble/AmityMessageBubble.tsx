// AmityMessageBubble — ported from AmityUiKitWeb features/shared/components/MessageBubble.
// Dispatches on message.dataType: a deleted message renders the deleted text; otherwise
// text / image / video each render their own bubble. Image + video resolve their file via
// useFile (image) / useVideoFileUrl (raw video url), show an upload overlay while a local
// preview is pending, and surface tap → open-in-viewer callbacks the parent wires up.
// Long-press surfaces the message action menu. Text path is full parity with web:
// @mention highlighting, "see more" (divider + chevron), link preview, "edited"
// caption, and link-aware line clamping.

// 1. React / RN imports
import { useState, type ReactNode } from 'react';
import {
  Image,
  Linking,
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

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
import { DeletedMessagePill } from '../../features/shared/components/DeletedMessagePill';
import { MessageLinkPreview } from '../../features/shared/components/MessageLinkPreview';
import { extractFirstPreviewUrl } from '../../utils/previewLink';
import {
  isSyntheticPendingMessage,
  type SyntheticPendingMessage,
} from '../../features/shared/hooks/useMessageComposer';
import { useVideoFileUrl } from '../../hooks/useVideoFileUrl';
import { useStyles } from './styles';

// PDT-4109: one flat limit for every text bubble. There used to be a second
// TEXT_MAX_LINES_WITH_LINK = 5 applied when the text contained a URL, which
// clamped link-bearing messages far earlier than plain ones. Web deleted that
// constant (and the hasLink regex that drove it) in dba25aa77.
const TEXT_MAX_LINES = 10; // web chat.ts
// Splits a text run into linkable (coloured/tappable) segments.
const URL_SPLIT_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function openLink(raw: string): void {
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  Linking.openURL(url).catch(() => {});
}

// Split a non-mention text run into plain strings + tappable link spans, ported
// from web's <Linkify> (navigable: onPress → Linking.openURL). linkStyle carries
// the underline (+ inbound-link colour when the bubble is inbound).
function renderLinkedText(
  text: string,
  keyPrefix: string,
  linkStyle: StyleProp<TextStyle>
): ReactNode[] {
  const out: ReactNode[] = [];
  text.split(URL_SPLIT_RE).forEach((part, i) => {
    if (!part) return;
    if (/^(?:https?:\/\/|www\.)/i.test(part)) {
      out.push(
        <Text
          key={`${keyPrefix}-l-${i}`}
          style={linkStyle}
          onPress={() => openLink(part)}
        >
          {part}
        </Text>
      );
    } else {
      out.push(part);
    }
  });
  return out;
}

// Render message text with @mention spans highlighted, ported from web
// renderTextWithMentions: metadata.mentioned = [{ index, length }] marks the runs to
// style with the mention token. Following web, only the non-mention runs are
// linkified (lead/tail slices) — mention spans stay plain — and in-text URLs render
// as tappable link spans (renderLinkedText).
function renderTextWithMentions(
  text: string,
  mentioned: { index: number; length: number }[] | undefined,
  mentionStyle: object,
  linkStyle: StyleProp<TextStyle>
): ReactNode {
  const spans = (mentioned ?? []).slice().sort((a, b) => a.index - b.index);
  if (spans.length === 0) return renderLinkedText(text, 't', linkStyle);

  const out: ReactNode[] = [];
  let cursor = 0;
  spans.forEach((m, i) => {
    const startsWithAt = text.charAt(m.index) === '@';
    const span = startsWithAt ? m.length + 1 : m.length;
    const start = Math.max(m.index, cursor);
    const end = Math.min(start + span, text.length);
    if (start > cursor) {
      out.push(
        ...renderLinkedText(text.slice(cursor, start), `t-${cursor}`, linkStyle)
      );
    }
    if (end > start) {
      out.push(
        <Text key={`m-${i}`} style={mentionStyle}>
          {text.slice(start, end)}
        </Text>
      );
    }
    cursor = end;
  });
  if (cursor < text.length) {
    out.push(...renderLinkedText(text.slice(cursor), 't-tail', linkStyle));
  }
  return out;
}

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
  /** Open the full-text "see more" screen for long messages. */
  onSeeMore?: (text: string, title?: string) => void;
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

// Web wrapWithFailedCaption: the "failed to send" helper caption appears under an
// image/video bubble ONLY when it failed for a moderation violation (a synthetic
// pending message whose __failureReason === 'moderation'). Generic failures show
// nothing.
function isModerationViolation(
  message: Amity.Message,
  isFailed: boolean
): boolean {
  return (
    isFailed &&
    isSyntheticPendingMessage(message) &&
    (message as SyntheticPendingMessage).__failureReason === 'moderation'
  );
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
  onSeeMore,
}: AmityMessageBubbleProps) {
  if (message.isDeleted) {
    return <DeletedMessagePill isUser={isUser} />;
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
          onSeeMore={onSeeMore}
        />
      );
  }
}

// ---------- Text ----------
type TextBubbleProps = {
  message: Amity.Message;
  isUser: boolean;
  onLongPress?: (message: Amity.Message) => void;
  onSeeMore?: (text: string, title?: string) => void;
};

function TextBubble({
  message,
  isUser,
  onLongPress,
  onSeeMore,
}: TextBubbleProps) {
  const { styles } = useStyles();
  const [pressed, setPressed] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const seeMoreLabel = useString('amity_chat_see_more');
  const editedLabel = useString('amity_chat_status_edited');

  const text = (message.data as { text?: string })?.text ?? '';
  const firstUrl = extractFirstPreviewUrl(text);
  // A failed message (synthetic, messageId === '') must NOT generate a link
  // preview — web suppresses it, and fetching metadata for the blocked link on a
  // synthetic crashes the list (PDT-4033 QA).
  const isFailed = message.syncState === ('error' as Amity.SyncState);
  const maxLines = TEXT_MAX_LINES;
  const isEdited = (message as { editedAt?: unknown }).editedAt != null;
  const mentioned = (
    message.metadata as
      | {
          mentioned?: { index: number; length: number }[];
        }
      | undefined
  )?.mentioned;

  const bubbleStyle = [
    styles.bubble,
    isUser ? styles.bubbleOwn : styles.bubbleOther,
    pressed && (isUser ? styles.bubbleOwnPressed : styles.bubbleOtherPressed),
  ];
  const textStyle = [styles.text, isUser ? styles.textOwn : styles.textOther];
  // Outbound links inherit the outbound message colour (web currentcolor);
  // inbound links recolour to the inbound-link token.
  const linkStyle = isUser ? styles.link : [styles.link, styles.linkOther];

  return (
    <Pressable
      style={bubbleStyle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onLongPress={onLongPress ? () => onLongPress(message) : undefined}
    >
      <View>
        <Text
          style={textStyle}
          numberOfLines={truncated ? maxLines : undefined}
          onTextLayout={(e) => {
            if (!truncated && e.nativeEvent.lines.length > maxLines) {
              setTruncated(true);
            }
          }}
        >
          {renderTextWithMentions(
            text,
            mentioned,
            isUser ? styles.mentionOwn : styles.mentionOther,
            linkStyle
          )}
        </Text>
        {/* Web render order: text → link preview → edited caption → see-more.
            The "See more" row is LAST (below the preview), not between the text
            and the preview (PDT-4047). */}
        {firstUrl && !isFailed ? (
          <View style={styles.preview}>
            <MessageLinkPreview url={firstUrl} isOwnMessage={isUser} />
          </View>
        ) : null}
        {isEdited ? (
          <Text
            style={[
              styles.editedCaption,
              isUser ? styles.editedOwn : styles.editedOther,
            ]}
          >
            {editedLabel}
          </Text>
        ) : null}
        {truncated && onSeeMore ? (
          <>
            <View
              style={[
                styles.divider,
                isUser ? styles.dividerOwn : styles.dividerOther,
              ]}
            />
            <Pressable
              style={styles.seeMoreRow}
              onPress={() => onSeeMore(text)}
              accessibilityRole="button"
              accessibilityLabel={seeMoreLabel}
            >
              <Text
                style={[
                  styles.seeMoreLabel,
                  isUser ? styles.seeMoreOwn : styles.seeMoreOther,
                ]}
              >
                {seeMoreLabel}
              </Text>
              <AmityIcon
                name="chevron-right"
                size={12}
                tokenColor={
                  isUser
                    ? AmityColorToken.IconChatBubbleOutboundSeeMoreDefault
                    : AmityColorToken.IconChatBubbleInboundSeeMoreDefault
                }
              />
            </Pressable>
          </>
        ) : null}
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
  const failedLabel = useString('amity_chat_message_failed_to_send');
  const fileId = getFileId(message);
  const mediumUrl = useFile({ fileId, imageSize: ImageSizeState.medium });
  const largeUrl = useFile({ fileId, imageSize: ImageSizeState.large });
  const [pressed, setPressed] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
  const isViolation = isModerationViolation(message, isFailed);

  const bubble = (
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
        onLoadStart={() => setLoaded(false)}
        onLoad={() => setLoaded(true)}
        onError={() => setHasLoadError(true)}
      />
      {/* BUG #5 — RN <Image> (unlike web's progressive <img>) renders nothing while a
          remote source downloads, so overlay a spinner on the media-loading surface
          until it loads. Skipped for a local preview (that path shows the upload
          overlay instead). RN-specific adaptation of web's image loading state. */}
      {!loaded && !localPreviewUrl ? (
        <View style={styles.mediaLoadingOverlay}>
          <Loader.Spinner size="lg" />
        </View>
      ) : null}
      {showUploadOverlay ? (
        <MediaUploadOverlay onCancel={onCancelUpload} />
      ) : null}
      {pressed ? <View style={styles.mediaPressedScrim} /> : null}
    </Pressable>
  );

  if (!isViolation) return bubble;
  return (
    <View style={styles.failedWrapper}>
      {bubble}
      <Text style={styles.failedCaption}>{failedLabel}</Text>
    </View>
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
  const failedLabel = useString('amity_chat_message_failed_to_send');
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
  const isViolation = isModerationViolation(message, isFailed);

  const bubble = (
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
      {/*
        The native <Video> view absorbs touches, which swallowed the bubble's
        onPress so the player never opened (images work because <Image> passes
        touches through). `pointerEvents` on the <Video> itself is NOT enough:
        on Android, TouchTargetHelper only reads pointerEvents off views that
        implement ReactPointerEventsView, and ReactViewGroup is the only one
        that does — so the prop is silently ignored on a native video view (both
        architectures). Wrapping it in a plain <View pointerEvents="none">
        excludes the whole subtree from touch targeting, so the tap reaches the
        Pressable → onOpenVideo. The wrapper carries mediaImage because the
        Video sizes at 100% and would collapse against a zero-size parent.
      */}
      <View style={styles.mediaImage} pointerEvents="none">
        <Video
          source={{ uri: thumbnailUri }}
          style={styles.mediaImage}
          resizeMode="cover"
          paused
          muted
          controls={false}
        />
      </View>
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

  if (!isViolation) return bubble;
  return (
    <View style={styles.failedWrapper}>
      {bubble}
      <Text style={styles.failedCaption}>{failedLabel}</Text>
    </View>
  );
}
