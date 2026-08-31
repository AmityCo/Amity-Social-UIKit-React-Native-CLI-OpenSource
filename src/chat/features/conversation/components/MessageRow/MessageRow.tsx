// MessageRow — ported from AmityUiKitWeb features/shared/components/MessageRow.
// Wraps a message bubble with its metadata: inbound sender avatar, sender name
// (inbound + group), reply quote (for replies), timestamp (own leading / other
// trailing) or sending/failed status, and a failed-retry affordance. Long-press
// opens the shared bubble action menu.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import useFile from '../../../../../core/hooks/useFile';
import { Typography } from '../../../../../core/design/components/Typography';
import { useString } from '../../../../../core/localization';
import { Avatar } from '../../../../elements/Avatar';
import { AmityMessageBubble } from '../../../../components/AmityMessageBubble';
import { AmityMessageActionMenu } from '../../../../components/AmityMessageActionMenu';
import { MessageReplyQuote } from '../../../shared/components/MessageReplyQuote';
import { MessageReactionBadge } from '../../../shared/components/MessageReactionBadge';
import { Button } from '../../../../../core/design/atoms/Button';
import { formatMessageTime } from '../../../../utils/timestamp';
import { useStyles } from './styles';

// 3. Types
type BubbleHandlers = {
  onEdit: () => void;
  onReply: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onSave: () => void;
  onReport: (message: Amity.Message) => void;
};

type MessageRowProps = {
  message: Amity.Message;
  isUser: boolean;
  isGroupChat?: boolean;
  currentUserId?: string | null;
  parent?: Amity.Message | null;
  onOpenImage?: (url: string, message: Amity.Message) => void;
  onOpenVideo?: (message: Amity.Message) => void;
  onOpenFailedSheet?: (message: Amity.Message) => void;
  onOpenBubbleMenu?: (message: Amity.Message) => void;
  onOpenReactorList?: (message: Amity.Message) => void;
  onSeeMore?: (text: string, title?: string) => void;
  bubbleHandlers?: BubbleHandlers;
  /** Viewer moderates this channel — unlocks Delete on other people's messages. */
  viewerIsModerator?: boolean;
  /** Local preview for an in-flight or failed upload (see MessageList). */
  localPreviewUrl?: string;
  /** The remote media has loaded — the local preview can be dropped. */
  onMediaLoaded?: (fileId: string) => void;
};

// 4. Named function component
export function MessageRow({
  message,
  isUser,
  isGroupChat = false,
  currentUserId,
  parent,
  onOpenImage,
  onOpenVideo,
  onOpenFailedSheet,
  onOpenBubbleMenu,
  onOpenReactorList,
  onSeeMore,
  bubbleHandlers,
  viewerIsModerator = false,
  localPreviewUrl,
  onMediaLoaded,
}: MessageRowProps) {
  const { styles } = useStyles();
  const sendingLabel = useString('amity_chat_sending_status');

  const creator = message.creator;
  const displayName = creator?.displayName ?? '';
  const avatarUrl = useFile({ fileId: creator?.avatarFileId ?? '' });

  const isDeleted = !!message.isDeleted;
  const syncState = message.syncState;
  const isSynced =
    syncState === undefined || syncState === ('synced' as Amity.SyncState);
  const isFailed = syncState === ('error' as Amity.SyncState);

  // The preview outlives the upload — MessageList keeps mapping it onto the real
  // message by fileId so the bubble doesn't flash back to a spinner while the
  // remote url warms. So "still uploading" has to come from syncState (the same
  // signal the Sending caption below uses), not from the preview's presence.
  const isUploading = !!localPreviewUrl && !isSynced && !isFailed;

  const showSenderName = !isUser && isGroupChat && !message.parentId;
  const timeText = message.createdAt
    ? formatMessageTime(message.createdAt)
    : '';

  const ownSide =
    isUser && !isDeleted ? (
      <Typography variant="captionSmall" style={styles.side}>
        {isSynced ? timeText : !isFailed ? sendingLabel : ''}
      </Typography>
    ) : null;
  const otherSide =
    !isUser && !isDeleted && timeText ? (
      <Typography variant="captionSmall" style={styles.side}>
        {timeText}
      </Typography>
    ) : null;

  return (
    <View style={[styles.row, isUser ? styles.rowOwn : styles.rowOther]}>
      {!isUser && creator ? (
        <View style={styles.avatar}>
          <Avatar.User
            avatarUrl={avatarUrl}
            displayName={displayName}
            size="sm"
          />
        </View>
      ) : null}

      <View
        style={[
          styles.content,
          isUser ? styles.contentOwn : styles.contentOther,
        ]}
      >
        {showSenderName ? (
          <Typography
            variant="captionBold"
            style={styles.senderName}
            numberOfLines={1}
          >
            {displayName}
          </Typography>
        ) : null}

        {message.parentId && !isDeleted ? (
          <MessageReplyQuote
            parent={parent}
            child={message}
            isUser={isUser}
            isGroupChat={isGroupChat}
            currentUserId={currentUserId}
            onOpenSeeMore={onSeeMore ?? (() => {})}
            onOpenImage={onOpenImage ?? (() => {})}
            onOpenVideo={onOpenVideo ?? (() => {})}
          />
        ) : null}

        <View style={styles.bubbleRow}>
          {ownSide}
          {isUser && isFailed ? (
            // Web renders a failed message as the bubble + a small Button.Icon
            // that opens the failed sheet (Resend/Delete), before the outbound
            // bubble. Web's `Exclamation` glyph is a BARE solid exclamation (not
            // circled) in a transparent/primary icon button — RN `exclamation-s`.
            <Button.Icon
              icon="exclamation-s"
              styleType="transparent"
              hierarchy="primary"
              size={24}
              // Web sizes this glyph independently of the button:
              // .messageRow__errorIcon is 1rem inside a 24px button. RN's
              // size-derived glyph for 24 is 24 (padding 0), so it rendered 50%
              // too large without this override.
              iconSize={16}
              // Web .messageRow__errorButton overrides the row's flex-end with
              // align-self: center, so the button sits level with the middle of
              // the bubble rather than its bottom edge.
              style={styles.failedButton}
              onPress={() => onOpenFailedSheet?.(message)}
              accessibilityLabel="Message failed to send"
            />
          ) : null}
          {isDeleted ? (
            <AmityMessageBubble message={message} isUser={isUser} />
          ) : isFailed ? (
            // A failed/synthetic message (never persisted, messageId === '') is
            // not interactive — no action menu / reaction picker (which would
            // subscribe on the empty messageId and crash). Web MessageRow renders
            // a failed message as the bubble + a retry affordance only.
            <AmityMessageBubble
              message={message}
              isUser={isUser}
              // Without the preview a failed upload has no media source, and the
              // bubble returns its loading placeholder before reaching the failed
              // caption — the missing inline error in PDT-4128.
              localPreviewUrl={localPreviewUrl}
              onOpenImage={onOpenImage}
              onOpenVideo={onOpenVideo}
              onSeeMore={onSeeMore}
            />
          ) : (
            <AmityMessageActionMenu
              message={message}
              currentUserId={currentUserId}
              viewerIsModerator={viewerIsModerator}
              placement={isUser ? 'bottom right' : 'bottom left'}
              handlers={{
                onEdit: bubbleHandlers?.onEdit ?? (() => {}),
                onReply: bubbleHandlers?.onReply ?? (() => {}),
                onDelete: bubbleHandlers?.onDelete ?? (() => {}),
                onCopy: bubbleHandlers?.onCopy ?? (() => {}),
                onSave: bubbleHandlers?.onSave ?? (() => {}),
                onReport: bubbleHandlers?.onReport ?? (() => {}),
              }}
              anchor={({ isOpen, openPopover }) => (
                <AmityMessageBubble
                  message={message}
                  isUser={isUser}
                  // Web keeps the bubble in its pressed colour for as long as the
                  // menu is open (Chat.tsx activeMessageId → isActive →
                  // data-active). The Popover already tracks that state; without
                  // passing it, onPressOut fires the moment the long-press is
                  // recognised and the bubble snaps back while the menu is up.
                  isActive={isOpen}
                  localPreviewUrl={localPreviewUrl}
                  isUploading={isUploading}
                  onMediaLoaded={onMediaLoaded}
                  onLongPress={() => {
                    onOpenBubbleMenu?.(message);
                    openPopover();
                  }}
                  onOpenImage={onOpenImage}
                  onOpenVideo={onOpenVideo}
                  onSeeMore={onSeeMore}
                />
              )}
            />
          )}
          {otherSide}
        </View>

        {!isDeleted && !isFailed ? (
          <View style={styles.reactionBadge}>
            <MessageReactionBadge
              message={message}
              onTap={() => onOpenReactorList?.(message)}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
