// AmityMessageBubble — ported from AmityUiKitWeb features/shared/components/MessageBubble.
// Dispatches on message.dataType: a deleted message renders the deleted text; otherwise
// text / image / video each render their own bubble. Image + video resolve their file via
// useFile (image) / useVideoFileUrl (raw video url), show an upload overlay while a local
// preview is pending, and surface tap → open-in-viewer callbacks the parent wires up.
// Long-press surfaces the message action menu. Text path is full parity with web:
// @mention highlighting, "see more" (divider + chevron), link preview, "edited"
// caption, and a flat 10-line clamp.

// 1. React / RN imports
import { useEffect, useState, type ReactNode } from 'react';
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
import { Skeleton } from '../../../../../core/design/components/Skeleton';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import { MediaUploadOverlay } from '../../elements/MediaUploadOverlay';
import { DeletedMessagePill } from '../../features/shared/components/DeletedMessagePill';
import { MessageLinkPreview } from '../../features/shared/components/MessageLinkPreview';
import { extractFirstPreviewUrl } from '../../utils/previewLink';
import { useVideoFileUrl } from '../../hooks/useVideoFileUrl';
import { useStyles } from './styles';

// PDT-4109: one flat limit for every text bubble. There used to be a second
// TEXT_MAX_LINES_WITH_LINK = 5 applied when the text contained a URL, which
// clamped link-bearing messages far earlier than plain ones. Web deleted that
// constant (and the hasLink regex that drove it) in dba25aa77.
const TEXT_MAX_LINES = 10; // web chat.ts
// Below this length a message cannot reach TEXT_MAX_LINES, so it skips the
// measuring pass — and the reserved See-more space — entirely. Well under the
// real threshold: the 240px bubble fits ~30 characters a line, ~300 for ten.
const MIN_CHARS_TO_OVERFLOW = 120;
// Skeleton bar height while a long message is measured — a shade under the 18px
// line height so two bars plus their gap read as two lines of text.
const SKELETON_LINE_HEIGHT = 14;
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
  /**
   * The media is still in flight. Derived from syncState by MessageRow — NOT
   * from `localPreviewUrl`, which outlives the upload: the preview is kept as
   * the display source after the message syncs so the bubble doesn't flash back
   * to a spinner while the remote url warms. Gating the overlay/tap/long-press
   * on the preview alone left the sender's own image stuck under a spinner and
   * permanently uninteractive once it had synced.
   */
  isUploading?: boolean;
  /**
   * The remote media finished loading, so the local preview can be dropped.
   * Web renders a hidden `<img>`/`<video>` of the remote url whose load event
   * fires this; RN uses `Image.prefetch` for images and a hidden `<Video>` for
   * videos (see the preloaders below) — same purpose: warm the remote source
   * BEFORE swapping, so the bubble never flashes an empty/loading frame.
   */
  onMediaLoaded?: (fileId: string) => void;
  /** Cancel an in-flight upload (shown on the upload overlay). */
  onCancelUpload?: () => void;
  /** Open the full-text "see more" screen for long messages. */
  onSeeMore?: (text: string, title?: string) => void;
  /**
   * Hold the pressed appearance while the action menu / reaction bar is open.
   * Web's data-active, driven off `activeMessageId === message.messageId`; the
   * CSS pairs it with `:active` so the colour never drops between the long-press
   * ending and the menu appearing.
   */
  isActive?: boolean;
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

// Web wrapWithFailedCaption: EVERY failed image/video bubble carries the
// "failed to send" caption — the only exception is an upload the user cancelled
// (web's __failureReason === 'cancelled'). It used to be moderation-only, which
// left a generic failure with no explanation at all; PDT-4128's oversize upload
// marks 'generic', so the inline error the ticket asks for depends on this.
//
// RN has no 'cancelled' reason: cancelling drops the pending upload via
// cancelledClientIdsRef instead of marking it failed, so there is nothing to
// exclude here and the gate is simply "did it fail".
function showsFailedCaption(isFailed: boolean): boolean {
  return isFailed;
}

// 5. Named function component (dispatcher)
export function AmityMessageBubble({
  message,
  isUser,
  onLongPress,
  onOpenImage,
  onOpenVideo,
  localPreviewUrl,
  isUploading = false,
  onMediaLoaded,
  onCancelUpload,
  onSeeMore,
  isActive = false,
}: AmityMessageBubbleProps) {
  if (message.isDeleted) {
    return <DeletedMessagePill isUser={isUser} />;
  }

  switch (message.dataType) {
    case 'image':
      return (
        <ImageBubble
          message={message}
          isActive={isActive}
          onOpenImage={onOpenImage}
          onLongPress={onLongPress}
          localPreviewUrl={localPreviewUrl}
          isUploading={isUploading}
          onMediaLoaded={onMediaLoaded}
          onCancelUpload={onCancelUpload}
        />
      );
    case 'video':
      return (
        <VideoBubble
          message={message}
          isActive={isActive}
          onOpenVideo={onOpenVideo}
          onLongPress={onLongPress}
          localPreviewUrl={localPreviewUrl}
          isUploading={isUploading}
          onMediaLoaded={onMediaLoaded}
          onCancelUpload={onCancelUpload}
        />
      );
    default:
      return (
        <TextBubble
          message={message}
          isUser={isUser}
          isActive={isActive}
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
  isActive?: boolean;
  onLongPress?: (message: Amity.Message) => void;
  onSeeMore?: (text: string, title?: string) => void;
};

function TextBubble({
  message,
  isUser,
  isActive = false,
  onLongPress,
  onSeeMore,
}: TextBubbleProps) {
  const { styles } = useStyles();
  const [pressed, setPressed] = useState(false);
  // null = not measured yet. The visible Text is clamped from the very first
  // frame either way, so this only decides whether "See more" is offered.
  const [overflowing, setOverflowing] = useState<boolean | null>(null);
  const seeMoreLabel = useString('amity_chat_see_more');
  const editedLabel = useString('amity_chat_status_edited');

  const text = (message.data as { text?: string })?.text ?? '';
  const firstUrl = extractFirstPreviewUrl(text);
  // A failed message (synthetic, messageId === '') must NOT generate a link
  // preview — web suppresses it, and fetching metadata for the blocked link on a
  // synthetic crashes the list (PDT-4033 QA).
  const isFailed = message.syncState === ('error' as Amity.SyncState);
  const maxLines = TEXT_MAX_LINES;
  // Only long text can possibly exceed maxLines, so only long text has to wait
  // for the measurement — everything else renders immediately and never sees a
  // loader. MIN_CHARS_TO_OVERFLOW is deliberately far below the real threshold
  // (a 240px bubble fits roughly 30 characters per line, so ~300 for 10 lines);
  // explicit newlines are counted too, since a short text can still be tall.
  const mightOverflow =
    text.length > MIN_CHARS_TO_OVERFLOW || text.split('\n').length > maxLines;
  const measuring = mightOverflow && overflowing === null;
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
    // Web: `.textBubble:active, .textBubble[data-active='true']` — the press AND
    // the open menu share one background, so releasing the long-press does not
    // flash the bubble back to its resting colour before the menu appears.
    (pressed || isActive) &&
      (isUser ? styles.bubbleOwnPressed : styles.bubbleOtherPressed),
  ];
  const textStyle = [styles.text, isUser ? styles.textOwn : styles.textOther];
  // Outbound links inherit the outbound message colour (web currentcolor);
  // inbound links recolour to the inbound-link token.
  const linkStyle = isUser ? styles.link : [styles.link, styles.linkOther];

  const seeMoreRow = onSeeMore ? (
    <>
      <View
        style={[
          styles.divider,
          isUser ? styles.dividerOwn : styles.dividerOther,
        ]}
      />
      <Pressable
        style={styles.seeMoreRow}
        // PDT-4150 (web PR 1824): the full-text page takes the sender's display
        // name as its centred header title; without it the header was blank. The
        // whole chain already carried the optional title — openSeeMore stores it
        // and MessageFullTextScreen renders it — only this call omitted it.
        onPress={() =>
          onSeeMore(text, message.creator?.displayName || undefined)
        }
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
  ) : null;

  return (
    <Pressable
      style={bubbleStyle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onLongPress={onLongPress ? () => onLongPress(message) : undefined}
    >
      <View>
        {/* A two-line skeleton stands in for a long message until its line count
            is known, so the bubble never renders in a shape it then changes out
            of. Reads as loading, unlike a spinner in a text-sized box. Short
            messages skip this entirely (MIN_CHARS_TO_OVERFLOW) and render at once.
            The fixed width matters beyond looks: the probe below measures against
            this container, so collapsing it to the placeholder's natural width
            would count lines for the wrong width. */}
        {measuring ? (
          <View style={styles.textSkeleton}>
            <Skeleton height={SKELETON_LINE_HEIGHT} />
            <Skeleton height={SKELETON_LINE_HEIGHT} width="60%" />
          </View>
        ) : (
          <Text style={textStyle} numberOfLines={maxLines}>
            {renderTextWithMentions(
              text,
              mentioned,
              isUser ? styles.mentionOwn : styles.mentionOther,
              linkStyle
            )}
          </Text>
        )}
        {/* The probe: an unclamped copy laid out once purely to count lines —
            RN's stand-in for web's scrollHeight/clientHeight check. It must be
            invisible (opacity 0, which does not affect layout so onTextLayout
            still fires) or it draws over whatever is showing; it only went
            unnoticed before because it overlapped identical text. The wrapping
            View is what carries pointerEvents: on a Text that prop is ignored on
            Android (TouchTargetHelper honours it only on a ReactViewGroup), so an
            absolutely-filling Text would swallow the bubble's long-press.
            Unmounted once answered. */}
        {mightOverflow && overflowing === null ? (
          <View
            style={styles.textProbe}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text
              style={textStyle}
              onTextLayout={(e) =>
                setOverflowing(e.nativeEvent.lines.length > maxLines)
              }
            >
              {renderTextWithMentions(
                text,
                mentioned,
                isUser ? styles.mentionOwn : styles.mentionOther,
                linkStyle
              )}
            </Text>
          </View>
        ) : null}
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
        {overflowing ? seeMoreRow : null}
      </View>
    </Pressable>
  );
}

// ---------- Image ----------
type ImageBubbleProps = {
  message: Amity.Message;
  isActive?: boolean;
  onOpenImage?: (url: string, message: Amity.Message) => void;
  onLongPress?: (message: Amity.Message) => void;
  localPreviewUrl?: string;
  isUploading?: boolean;
  onMediaLoaded?: (fileId: string) => void;
  onCancelUpload?: () => void;
};

function ImageBubble({
  message,
  isActive = false,
  onOpenImage,
  onLongPress,
  localPreviewUrl,
  isUploading = false,
  onMediaLoaded,
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
  const [preloaded, setPreloaded] = useState(false);

  const isFailed = isErrorState(message);
  const displaySrc = localPreviewUrl ?? mediumUrl;
  const openUrl = largeUrl ?? mediumUrl;

  // Web renders a hidden <img src={mediumUrl} onLoad={onMediaLoaded}> next to the
  // preview: it warms the remote image, and only once it has decoded does the
  // pending upload (and with it the preview) get dropped, so the swap from local
  // file → CDN url is invisible. RN's equivalent is Image.prefetch, which fills
  // the same image cache the <Image> below reads from — no extra view needed.
  // `preloaded` then suppresses the remote-download spinner for the swap, since
  // changing `source` resets `loaded` even when the bitmap is already cached.
  useEffect(() => {
    if (!localPreviewUrl || !mediumUrl || !fileId || !onMediaLoaded)
      return undefined;
    let cancelled = false;
    Image.prefetch(mediumUrl)
      .then(() => {
        if (cancelled) return;
        setPreloaded(true);
        onMediaLoaded(fileId);
      })
      // A prefetch failure must not strand the preview: the <Image> retries the
      // same url on its own, so just leave the pending upload in place.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [localPreviewUrl, mediumUrl, fileId, onMediaLoaded]);

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

  const showUploadOverlay = isUploading && !isFailed;
  const canOpen = !!onOpenImage && !!openUrl && !isFailed && !isUploading;
  const showFailedCaption = showsFailedCaption(isFailed);

  const bubble = (
    <Pressable
      style={styles.imageBubble}
      accessibilityRole="button"
      accessibilityLabel="Open image"
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={canOpen ? () => onOpenImage!(openUrl!, message) : undefined}
      onLongPress={
        isFailed || isUploading || !onLongPress
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
      {!loaded && !localPreviewUrl && !preloaded ? (
        <View style={styles.mediaLoadingOverlay}>
          <Loader.Spinner size="lg" />
        </View>
      ) : null}
      {showUploadOverlay ? (
        <MediaUploadOverlay onCancel={onCancelUpload} />
      ) : null}
      {/* Web: `.imageBubble:active::after, .imageBubble[data-active='true']::after`
          (same for videoBubble) — one overlay for both press and open menu. */}
      {pressed || isActive ? (
        <View style={styles.mediaPressedScrim} pointerEvents="none" />
      ) : null}
    </Pressable>
  );

  if (!showFailedCaption) return bubble;
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
  isActive?: boolean;
  onOpenVideo?: (message: Amity.Message) => void;
  onLongPress?: (message: Amity.Message) => void;
  localPreviewUrl?: string;
  isUploading?: boolean;
  onMediaLoaded?: (fileId: string) => void;
  onCancelUpload?: () => void;
};

function VideoBubble({
  message,
  isActive = false,
  onOpenVideo,
  onLongPress,
  localPreviewUrl,
  isUploading = false,
  onMediaLoaded,
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

  const showUploadOverlay = isUploading && !isFailed;
  const canOpen = !!onOpenVideo && !isFailed && !isUploading;
  const showFailedCaption = showsFailedCaption(isFailed);

  const bubble = (
    <Pressable
      style={styles.videoBubble}
      accessibilityRole="button"
      accessibilityLabel="Play video"
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={canOpen ? () => onOpenVideo!(message) : undefined}
      onLongPress={
        isFailed || isUploading || !onLongPress
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
      {/* Web's hidden preload <video src={videoUrl} onLoadedMetadata={...}>: warm
          the remote video so the pending upload (and its preview) is only dropped
          once the CDN source can render, otherwise the swap shows a black frame
          while the remote stream opens. RN's <Video onLoad> is the onLoadedMetadata
          equivalent. Mounted only in the narrow preview+remote window, and wrapped
          in a pointerEvents="none" View for the same touch reason as above. */}
      {localPreviewUrl && videoUrl && fileId && onMediaLoaded ? (
        <View style={styles.mediaPreload} pointerEvents="none">
          <Video
            source={{ uri: videoUrl }}
            style={styles.mediaPreload}
            paused
            muted
            controls={false}
            onLoad={() => onMediaLoaded(fileId)}
          />
        </View>
      ) : null}
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
      {/* Web: `.imageBubble:active::after, .imageBubble[data-active='true']::after`
          (same for videoBubble) — one overlay for both press and open menu. */}
      {pressed || isActive ? (
        <View style={styles.mediaPressedScrim} pointerEvents="none" />
      ) : null}
    </Pressable>
  );

  if (!showFailedCaption) return bubble;
  return (
    <View style={styles.failedWrapper}>
      {bubble}
      <Text style={styles.failedCaption}>{failedLabel}</Text>
    </View>
  );
}
