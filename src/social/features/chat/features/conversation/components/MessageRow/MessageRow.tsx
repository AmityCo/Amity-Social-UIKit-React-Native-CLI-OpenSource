// MessageRow — ported from AmityUiKitWeb features/shared/components/MessageRow.
// Wraps a message bubble with the surrounding metadata: the sender avatar (for
// inbound messages), the sender name (inbound + group chat), and the timestamp
// (formatMessageTime) — own on the leading side, other on the trailing side.
// Reactions / reply-quote / failed-retry layer on in later M2 tasks.

// 1. React / RN imports
import { View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

// 2. Internal imports
import useFile from '../../../../../../../core/hooks/useFile';
import { Typography } from '../../../../../../../core/design/components/Typography';
import { useString } from '../../../../../../../core/localization';
import { Avatar } from '../../../../elements/Avatar';
import { AmityMessageBubble } from '../../../../components/AmityMessageBubble';
import { AmityMessageActionMenu } from '../../../../components/AmityMessageActionMenu';
import { formatMessageTime } from '../../../../utils/timestamp';
import { useStyles } from './styles';

// 3. Types
type MessageRowProps = {
  message: Amity.Message;
  isUser: boolean;
  isGroupChat?: boolean;
  currentUserId?: string | null;
  onOpenImage?: (url: string, message: Amity.Message) => void;
  onOpenVideo?: (message: Amity.Message) => void;
  onReplyMessage?: (message: Amity.Message) => void;
  onEditMessage?: (message: Amity.Message) => void;
  onDeleteMessage?: (message: Amity.Message) => void;
};

// 4. Named function component
export function MessageRow({
  message,
  isUser,
  isGroupChat = false,
  currentUserId,
  onOpenImage,
  onOpenVideo,
  onReplyMessage,
  onEditMessage,
  onDeleteMessage,
}: MessageRowProps) {
  const { styles } = useStyles();
  const sendingLabel = useString('amity_chat_sending_status');

  const creator = message.creator;
  const displayName = creator?.displayName ?? '';
  const avatarUrl = useFile({ fileId: creator?.avatarFileId ?? '' });

  const isDeleted = !!message.isDeleted;
  const syncState = message.syncState;
  // Loaded collection messages may omit syncState — treat that as synced.
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
        <View style={styles.bubbleRow}>
          {ownSide}
          {isDeleted ? (
            <AmityMessageBubble message={message} isUser={isUser} />
          ) : (
            <AmityMessageActionMenu
              message={message}
              currentUserId={currentUserId}
              handlers={{
                onEdit: () => onEditMessage?.(message),
                onReply: () => onReplyMessage?.(message),
                onDelete: () => onDeleteMessage?.(message),
                onCopy: () =>
                  Clipboard.setString(
                    (message.data as { text?: string })?.text ?? ''
                  ),
                onSave: () => {},
                onReport: () => {},
              }}
              anchor={({ openPopover }) => (
                <AmityMessageBubble
                  message={message}
                  isUser={isUser}
                  onLongPress={() => openPopover()}
                  onOpenImage={onOpenImage}
                  onOpenVideo={onOpenVideo}
                />
              )}
            />
          )}
          {otherSide}
        </View>
      </View>
    </View>
  );
}
