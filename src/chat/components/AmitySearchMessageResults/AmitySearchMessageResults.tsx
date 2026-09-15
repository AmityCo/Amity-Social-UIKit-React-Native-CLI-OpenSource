// AmitySearchMessageResults — ported from AmityUiKitWeb
// v4/chat/features/search/components/SearchMessageList.
// The "Messages" tab of chat search: a live, paginated list of messages matching
// the query, each rendered as a channel row whose preview shows the matched text
// and whose timestamp is the message's createdAt.
//
// RN adaptations from web:
//   - Web `useIntersectionObserver` sentinel → FlatList `onEndReached`.
//
// PDT-5251 / PDT-5270 / PDT-5252 closed the three deviations this port carried:
// AmityChatListItem now takes web's `messageBodyOverride` / `timestampOverride` /
// `searchQuery` / `highlightStyle` props (replacing the shallow-cloned-channel
// workaround and adding the missing matched-text highlight), and RouteParamList
// carries `jumpToMessageId` so tapping a result scrolls the thread to it.

// 1. React / RN imports
import { useMemo } from 'react';
import { FlatList, View } from 'react-native';

// 2. Third-party imports
import { Client } from '@amityco/ts-sdk-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import type { RootStackParamList } from '../../../core/routes/RouteParamList';
import {
  LIST_SKELETON_ROW_COUNT,
  SEARCH_MIN_QUERY_LENGTH,
} from '../../constants';
import {
  useMessageSearchCollection,
  useChannelsByIdsCollection,
  useArchivedChannelsCollection,
} from '../../hooks/collections';
import { AmityChatListItem } from '../AmityChatListItem';
import { EmptyState } from '../../features/shared/components/EmptyState';
import { useStyles } from '../AmitySearchChannelResults/styles';

// 4. Types
export type AmitySearchMessageResultsProps = {
  query: string;
};

// 5. Named function component
export function AmitySearchMessageResults({
  query,
}: AmitySearchMessageResultsProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentUserId = Client.getCurrentUser()?.userId;

  const trimmed = query.trim();
  const shouldCall = trimmed.length >= SEARCH_MIN_QUERY_LENGTH;

  const { channels: archivedChannels } = useArchivedChannelsCollection({
    limit: 100,
  });
  const archivedIds = useMemo(
    () => new Set(archivedChannels.map((c) => c.channelId)),
    [archivedChannels]
  );

  const { messages, loading, hasNextPage, loadMore } =
    useMessageSearchCollection({ query: trimmed });

  const channelIds = useMemo(
    () => Array.from(new Set(messages.map((m) => m.channelId))),
    [messages]
  );

  const { channels: matchedChannels } = useChannelsByIdsCollection(channelIds);
  const channelById = useMemo(
    () => new Map(matchedChannels.map((c) => [c.channelId, c])),
    [matchedChannels]
  );

  const isLoadingFirstPage = loading && messages.length === 0;

  function handleNavigate(message: Amity.Message) {
    const channel = channelById.get(message.channelId);
    if (!channel) return;
    // PDT-5252: carry the matched message id so the thread scrolls to it, the
    // way web pushes ChatPage/GroupChatPage with `jumpToMessageId`.
    if (channel.type === 'community') {
      navigation.navigate('AmityGroupChatPage', {
        channelId: channel.channelId,
        jumpToMessageId: message.messageId,
      });
    } else {
      const otherMember = channel.previewMembers?.find(
        (m) => m.userId !== currentUserId
      );
      navigation.navigate('AmityChatPage', {
        channelId: channel.channelId,
        userDisplayName: otherMember?.user?.displayName,
        jumpToMessageId: message.messageId,
      });
    }
  }

  if (!shouldCall) {
    return <EmptyState variant="prompt" />;
  }

  if (messages.length === 0 && !isLoadingFirstPage) {
    return <EmptyState variant="no-results" />;
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={messages}
      keyExtractor={(message) => message.messageId}
      renderItem={({ item: message }) => {
        const channel = channelById.get(message.channelId);
        if (!channel) return null;
        const text =
          (message.data as { text?: string } | undefined)?.text ?? '';
        return (
          <AmityChatListItem
            channel={channel}
            isArchived={archivedIds.has(channel.channelId)}
            searchQuery={trimmed}
            highlightStyle="bold"
            messageBodyOverride={text}
            timestampOverride={message.createdAt as string}
            hideUnreadIndicators
            onPress={() => handleNavigate(message)}
          />
        );
      }}
      onEndReachedThreshold={0.7}
      onEndReached={() => {
        if (hasNextPage && !isLoadingFirstPage) loadMore();
      }}
      ListFooterComponent={
        isLoadingFirstPage ? (
          <View>
            {Array.from({ length: LIST_SKELETON_ROW_COUNT }).map((_, i) => (
              <AmityChatListItem.Skeleton key={i} />
            ))}
          </View>
        ) : hasNextPage ? (
          <AmityChatListItem.Skeleton />
        ) : null
      }
    />
  );
}
