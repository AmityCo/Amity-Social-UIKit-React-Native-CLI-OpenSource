// MessageRow — ported from AmityUiKitWeb features/shared/components/MessageRow.
// Wraps a message bubble with its metadata: inbound sender avatar, sender name
// (inbound + group), reply quote (for replies), timestamp (own leading / other
// trailing) or sending/failed status, and a failed-retry affordance. Long-press
// opens the shared bubble action menu.

// 1. React / RN imports
import { Pressable, View } from 'react-native';

// 2. Internal imports
import useFile from '../../../../../../../core/hooks/useFile';
import { Typography } from '../../../../../../../core/design/components/Typography';
import { useString } from '../../../../../../../core/localization';
import { Avatar } from '../../../../elements/Avatar';
import { AmityMessageBubble } from '../../../../components/AmityMessageBubble';
import { AmityMessageActionMenu } from '../../../../components/AmityMessageActionMenu';
import { MessageReplyQuote } from '../../../shared/components/MessageReplyQuote';
import { MessageReactionBadge } from '../../../shared/components/MessageReactionBadge';
import { FailedToShow } from '../../../shared/components/FailedToShow';
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
          {isDeleted ? (
            <AmityMessageBubble message={message} isUser={isUser} />
          ) : (
            <AmityMessageActionMenu
              message={message}
              currentUserId={currentUserId}
              placement={isUser ? 'bottom right' : 'bottom left'}
              handlers={{
                onEdit: bubbleHandlers?.onEdit ?? (() => {}),
                onReply: bubbleHandlers?.onReply ?? (() => {}),
                onDelete: bubbleHandlers?.onDelete ?? (() => {}),
                onCopy: bubbleHandlers?.onCopy ?? (() => {}),
                onSave: bubbleHandlers?.onSave ?? (() => {}),
                onReport: bubbleHandlers?.onReport ?? (() => {}),
              }}
              anchor={({ openPopover }) => (
                <AmityMessageBubble
                  message={message}
                  isUser={isUser}
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

        {!isDeleted ? (
          <View style={styles.reactionBadge}>
            <MessageReactionBadge
              message={message}
              onTap={() => onOpenReactorList?.(message)}
            />
          </View>
        ) : null}

        {isUser && isFailed ? (
          <Pressable onPress={() => onOpenFailedSheet?.(message)}>
            <FailedToShow />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
