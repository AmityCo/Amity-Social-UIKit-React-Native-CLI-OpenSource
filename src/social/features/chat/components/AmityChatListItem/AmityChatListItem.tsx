// AmityChatListItem — ported from AmityUiKitWeb v4/chat/features/home/components/ChannelItem.
// One row of the channel list: leading avatar (1:1 conversation or group), a name
// row (name + optional member count + timestamp) and a preview row (last message
// preview + mention/unread/archived trailing badges).
//
// RN adaptations from web:
//   - Web resolves the current user via `useSDK().currentUserId`; here we read
//     `Client.getCurrentUser()` (prop `currentUserId` overrides it).
//   - Avatar image URLs are resolved from a fileId via the shared `useFile` hook
//     (getFile → fileUrlWithSize), then handed to the presentational avatars.
//   - Web `onClick`/internal ChatNavigation is replaced by a plain `onPress`
//     callback wired by the page (no React Navigation import here).
//   - Search highlighting is out of scope for the home list (never passed a query).

// 1. React / RN imports
import { useMemo, type ReactNode } from 'react';
import { View, Pressable } from 'react-native';

// 2. Third-party imports
import { Client } from '@amityco/ts-sdk-react-native';

// 3. Internal imports (relative)
import { Typography } from '../../../../../core/design/components/Typography';
import { Badge } from '../../../../../core/design/atoms/Badge';
import { Skeleton } from '../../../../../core/design/components/Skeleton';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import useFile from '../../../../../core/hooks/useFile';
import { Avatar } from '../../elements/Avatar';
import { ConversationChatAvatar } from '../../elements/ConversationChatAvatar';
import { ArchivedBadge } from '../../elements/ArchivedBadge';
import { formatTimestamp } from '../../utils/timestamp';
import { highlightMatch } from '../../utils/highlightMatch';
import { useStyles } from './styles';

// Search-match highlight colours (web channelItem__highlight /
// channelItem__highlightBold). Both are referenced so either style is available.
const HIGHLIGHT_TOKEN = {
  primary: AmityColorToken.TextListHeaderDefaultHighlight,
  bold: AmityColorToken.TextListTextDescriptionDefaultHighlight,
} as const;

// 4. Types
export type AmityChatListItemProps = {
  channel: Amity.Channel;
  isArchived?: boolean;
  hideUnreadIndicators?: boolean;
  /** Overrides the SDK-resolved current user id. */
  currentUserId?: string;
  /** Row press handler — the page wires navigation. */
  onPress?: () => void;
  /** When set (search results), highlights the matched substring in the name. */
  searchQuery?: string;
  /** Which highlight colour to use for the matched substring. */
  highlightStyle?: keyof typeof HIGHLIGHT_TOKEN;
};

const MODERATOR_ROLES = [
  'moderator',
  'community-moderator',
  'channel-moderator',
];
const MENTION_REGEX = /@\S+/g;
const PREVIEW_ICON_SIZE = 20;

type DeletableUser = (Amity.InternalUser & { isDeleted?: boolean }) | undefined;

function hasModeratorRole(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => MODERATOR_ROLES.includes(role));
}

function formatMemberCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

// 5. Named function component
export function AmityChatListItem({
  channel,
  isArchived = false,
  hideUnreadIndicators = false,
  currentUserId: currentUserIdProp,
  onPress,
  searchQuery,
  highlightStyle = 'primary',
}: AmityChatListItemProps) {
  const { styles, token } = useStyles();

  const currentUserId = useMemo(
    () => currentUserIdProp ?? Client.getCurrentUser()?.userId,
    [currentUserIdProp]
  );

  const isConversation = channel.type === 'conversation';
  const otherMember = isConversation
    ? channel.previewMembers?.find((m) => m.userId !== currentUserId)
    : undefined;
  const otherUser = otherMember?.user as DeletableUser;
  const isUserDeleted = Boolean(otherUser?.isDeleted);
  const isModerator = hasModeratorRole(otherMember?.roles);

  // Resolve the leading avatar image from whichever fileId applies. Called once,
  // unconditionally, to keep hook order stable across channel types.
  const avatarFileId = isConversation
    ? otherUser?.avatarFileId
    : channel.avatarFileId;
  const avatarUrl = useFile({ fileId: avatarFileId ?? '' });

  const timestampSource = channel.lastActivity;
  const timestamp = timestampSource ? formatTimestamp(timestampSource) : '';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.avatarWrapper}>
        {isConversation ? (
          <ConversationChatAvatar
            avatarUrl={avatarUrl}
            displayName={otherUser?.displayName}
            isDeleted={isUserDeleted}
            isModerator={isModerator}
          />
        ) : (
          <Avatar.GroupChat avatarUrl={avatarUrl} isPublic={channel.isPublic} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <View style={styles.nameGroup}>
            <ChannelName
              channel={channel}
              otherUser={otherUser}
              isUserDeleted={isUserDeleted}
              searchQuery={searchQuery}
              highlightStyle={highlightStyle}
            />
          </View>
          <Typography
            variant="caption"
            style={styles.timestamp}
            numberOfLines={1}
          >
            {timestamp}
          </Typography>
        </View>

        <View style={styles.previewRow}>
          <MessagePreview
            preview={channel.messagePreview}
            iconColor={token(AmityColorToken.IconListDescriptionGeneral)}
          />
          <View style={styles.notifications}>
            {!hideUnreadIndicators && channel.isMentioned && <MentionBadge />}
            {isArchived && <ArchivedBadge />}
            {!hideUnreadIndicators && (
              <UnreadBadge count={channel.unreadCount ?? 0} />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// --- Sub-views ---------------------------------------------------------------

function ChannelName({
  channel,
  otherUser,
  isUserDeleted,
  searchQuery,
  highlightStyle = 'primary',
}: {
  channel: Amity.Channel;
  otherUser: DeletableUser;
  isUserDeleted: boolean;
  searchQuery?: string;
  highlightStyle?: keyof typeof HIGHLIGHT_TOKEN;
}) {
  const { styles, token } = useStyles();
  const deletedUserLabel = useString('amity_chat_deleted_user');

  // Render a name with the matched search substring highlighted (web ChannelItem).
  const renderName = (name: string) =>
    searchQuery
      ? highlightMatch(name, searchQuery, {
          color: token(HIGHLIGHT_TOKEN[highlightStyle]),
        })
      : name;

  if (channel.type === 'conversation') {
    if (isUserDeleted) {
      return (
        <Typography style={styles.nameDeleted} numberOfLines={1}>
          {deletedUserLabel}
        </Typography>
      );
    }
    const name = otherUser?.displayName ?? channel.displayName ?? '';
    return (
      <Typography style={styles.name} numberOfLines={1}>
        {renderName(name)}
      </Typography>
    );
  }

  const memberCount = channel.memberCount;
  const name = channel.displayName ?? '';
  return (
    <>
      <Typography style={styles.name} numberOfLines={1}>
        {renderName(name)}
      </Typography>
      {memberCount != null && memberCount > 0 && (
        <Typography style={styles.memberCount} numberOfLines={1}>
          ({formatMemberCount(memberCount)})
        </Typography>
      )}
    </>
  );
}

type PreviewStrings = {
  noMessage: string;
  sentPhoto: string;
  sentVideo: string;
  noPreview: string;
};

function getPreviewText(
  preview: Amity.Channel['messagePreview'],
  t: PreviewStrings
): string {
  if (!preview) return t.noMessage;

  const text = (preview.data as { text?: string } | undefined)?.text;
  if (typeof text === 'string' && text.length > 0) return text;

  switch (preview.dataType) {
    case 'text':
      return text ?? '';
    case 'image':
      return t.sentPhoto;
    case 'video':
      return t.sentVideo;
    case 'file':
    case 'audio':
      return t.noPreview;
    default:
      return t.noMessage;
  }
}

function MessagePreview({
  preview,
  iconColor,
}: {
  preview: Amity.Channel['messagePreview'];
  iconColor: string;
}) {
  const { styles } = useStyles();
  const previewDeletedLabel = useString('amity_chat_preview_deleted');
  const previewStrings: PreviewStrings = {
    noMessage: useString('amity_chat_preview_no_message'),
    sentPhoto: useString('amity_chat_preview_sent_photo'),
    sentVideo: useString('amity_chat_preview_sent_video'),
    noPreview: useString('amity_chat_message_no_preview'),
  };

  if (preview?.isDeleted) {
    return (
      <View style={styles.previewWithIcon}>
        <AmityIcon name="trash-s" size={PREVIEW_ICON_SIZE} color={iconColor} />
        <Typography style={styles.preview} numberOfLines={1}>
          {previewDeletedLabel}
        </Typography>
      </View>
    );
  }

  const text = getPreviewText(preview, previewStrings);

  if (preview?.dataType === 'image' || preview?.dataType === 'video') {
    const iconName = preview.dataType === 'image' ? 'image-s' : 'circle-play-s';
    return (
      <View style={styles.previewWithIcon}>
        <AmityIcon name={iconName} size={PREVIEW_ICON_SIZE} color={iconColor} />
        <Typography style={styles.preview} numberOfLines={1}>
          {text}
        </Typography>
      </View>
    );
  }

  if (preview?.dataType !== 'text' || text.length === 0) {
    return (
      <Typography style={styles.preview} numberOfLines={1}>
        {text}
      </Typography>
    );
  }

  // Highlight @mentions inside the text preview (base rendering, not search).
  const parts: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = 0;
  for (const match of text.matchAll(MENTION_REGEX)) {
    const start = match.index ?? 0;
    const token = match[0];
    const end = start + token.length;
    if (start > cursor) {
      parts.push(
        <Typography key={`t-${cursor}`}>{text.slice(cursor, start)}</Typography>
      );
    }
    parts.push(
      <Typography key={`m-${matchIndex}`} style={styles.previewMention}>
        {token}
      </Typography>
    );
    cursor = end;
    matchIndex += 1;
  }

  if (parts.length === 0) {
    return (
      <Typography style={styles.preview} numberOfLines={1}>
        {text}
      </Typography>
    );
  }

  if (cursor < text.length) {
    parts.push(<Typography key="t-tail">{text.slice(cursor)}</Typography>);
  }

  return (
    <Typography style={styles.preview} numberOfLines={1}>
      {parts}
    </Typography>
  );
}

function MentionBadge() {
  return (
    <Badge.Icon
      icon="at-s"
      preset={{ family: 'chat', case: 'mention' }}
      size={20}
    />
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Badge.Label
      label={count > 99 ? '99+' : String(count)}
      preset={{ family: 'general', case: 'notification' }}
      size={20}
    />
  );
}

// --- Skeleton ----------------------------------------------------------------

function AmityChatListItemSkeleton() {
  const { styles } = useStyles();
  return (
    <View style={styles.skeletonRow}>
      <Skeleton circle width={40} height={40} />
      <Skeleton width={140} height={10} />
    </View>
  );
}

AmityChatListItem.Skeleton = AmityChatListItemSkeleton;
