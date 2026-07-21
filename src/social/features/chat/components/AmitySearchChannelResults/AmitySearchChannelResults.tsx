// AmitySearchChannelResults — ported from AmityUiKitWeb
// v4/chat/features/search/components/SearchChannelList.
// The "Chats" tab of chat search: a live, paginated list of channels matching the
// query, each swipeable to archive/unarchive.
//
// RN adaptations from web:
//   - Web `useIntersectionObserver` sentinel → FlatList `onEndReached`.
//   - Web `ChannelItem` (with internal ChatNavigation + `searchQuery` highlight)
//     → the shared `AmityChatListItem`. AmityChatListItem exposes no `searchQuery`
//     prop, so the matched-text highlight is not rendered (documented deviation);
//     row navigation is wired here via React Navigation, mirroring AmityChatHomePage.
//   - Web `Archive`/`Unarchive` SVG icons → the registry `arhive-r`/`unarhive-r`
//     glyphs (same regular variant ArchivedBadge uses).

// 1. React / RN imports
import { useMemo } from 'react';
import { FlatList, View } from 'react-native';

// 2. Third-party imports
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { useString } from '../../../../../core/localization';
import {
  LIST_PAGE_LIMIT,
  LIST_SKELETON_ROW_COUNT,
  SEARCH_MIN_QUERY_LENGTH,
} from '../../constants';
import {
  useSearchChannelsCollection,
  useArchivedChannelsCollection,
} from '../../hooks/collections';
import { useChannelArchiveQuery } from '../../hooks/queries';
import { AmityChatListItem } from '../AmityChatListItem';
import { EmptyState } from '../../features/shared/components/EmptyState';
import { SwipeToLeft } from './SwipeToLeft';
import { useStyles } from './styles';

// 4. Types
export type AmitySearchChannelResultsProps = {
  query: string;
};

// 5. Named function component
export function AmitySearchChannelResults({
  query,
}: AmitySearchChannelResultsProps) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { archiveChannel, unarchiveChannel } = useChannelArchiveQuery();
  const archiveLabel = useString('amity_chat_archive');
  const unarchiveLabel = useString('amity_chat_unarchive');

  const trimmed = query.trim();
  const shouldCall = trimmed.length >= SEARCH_MIN_QUERY_LENGTH;

  const { channels: archivedChannels } = useArchivedChannelsCollection({
    limit: 100,
  });
  const archivedIds = useMemo(
    () => new Set(archivedChannels.map((c) => c.channelId)),
    [archivedChannels]
  );

  const { channels, loading, hasNextPage, loadMore } =
    useSearchChannelsCollection(
      {
        query: trimmed,
        limit: LIST_PAGE_LIMIT,
        isMemberOnly: true,
        types: ['conversation', 'community'],
        sortBy: 'lastActivity',
        orderBy: 'desc',
      },
      { shouldCall }
    );

  const isLoadingFirstPage = loading && channels.length === 0;

  function handlePress(channel: Amity.Channel) {
    if (channel.type === 'community') {
      navigation.navigate('AmityGroupChatPage', {
        channelId: channel.channelId,
      });
    } else {
      navigation.navigate('AmityChatPage', {
        channelId: channel.channelId,
        userDisplayName: channel.displayName,
      });
    }
  }

  if (!shouldCall) {
    return <EmptyState variant="prompt" />;
  }

  if (channels.length === 0 && !isLoadingFirstPage) {
    return <EmptyState variant="no-results" />;
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={channels}
      keyExtractor={(channel) => channel.channelId}
      renderItem={({ item }) => {
        const isArchived = archivedIds.has(item.channelId);
        return (
          <SwipeToLeft
            actionLabel={isArchived ? unarchiveLabel : archiveLabel}
            actionIcon={isArchived ? 'unarhive-r' : 'arhive-r'}
            onAction={() =>
              isArchived
                ? unarchiveChannel({ channelId: item.channelId })
                : archiveChannel({ channelId: item.channelId })
            }
          >
            <AmityChatListItem
              channel={item}
              isArchived={isArchived}
              searchQuery={trimmed}
              onPress={() => handlePress(item)}
            />
          </SwipeToLeft>
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
