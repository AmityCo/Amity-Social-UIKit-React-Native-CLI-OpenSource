// ChannelList — ported from AmityUiKitWeb v4/chat/features/home/components/ChannelList.
// Renders a live list of channels for the given types via an RN FlatList.
//
// RN adaptations from web:
//   - Web's IntersectionObserver sentinel → FlatList `onEndReached`.
//   - Web's SwipeToLeft (framer-motion) swipe-to-archive → react-native-gesture-handler
//     `Swipeable` (renderRightActions + onSwipeableWillOpen → archiveChannel); needs
//     GestureHandlerRootView at the app root. Web also passes excludeArchives:true so
//     archived channels drop out of the main list — mirrored here.
//   - The empty-state illustration (web-only) is replaced by an AmityIcon glyph.
//   - Navigation is delegated to `onChannelPress(channelId)` from the page.
//   - Mark-as-read on row tap: web's canonical mark-read happens on conversation
//     OPEN (message-level `Amity.Message#markRead()` via useChatMessage/useMarkAsRead,
//     already wired for the RN Chat/GroupChat screens). To clear the list's unread
//     count immediately on tap, we additionally call
//     `SubChannelRepository.startMessageReceiptSync(defaultSubChannelId)` here — the
//     SDK marks all messages in the sub-channel read. Fire-and-forget; failures are
//     non-fatal (the conversation-open path still marks read).

// 1. React / RN imports
import { FlatList, View } from 'react-native';

// 2. Third-party imports
import { Swipeable } from 'react-native-gesture-handler';
import { SubChannelRepository } from '@amityco/ts-sdk-react-native';

// 3. Internal imports (relative)
import { Typography } from '../../../../../../../core/design/components/Typography';
import { Button } from '../../../../../../../core/design/atoms/Button';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import { AmityChatListItem } from '../../../../components/AmityChatListItem';
import { useChannelsCollection } from '../../../../hooks/collections/useChannelsCollection';
import { useChannelArchiveQuery } from '../../../../hooks/queries';
import { useStyles } from './styles';

const SKELETON_ROW_COUNT = 9;
const ACTION_ICON_SIZE = 28;

// 3. Types
export type ChannelListProps = {
  types?: Amity.ChannelType[];
  /** Called with the pressed channel id + display name + type — the page wires navigation. */
  onChannelPress?: (
    channelId: string,
    displayName?: string,
    type?: Amity.ChannelType
  ) => void;
  /** Called when the empty-state create button is pressed. */
  onCreatePress?: () => void;
};

// 4. Named function component
export function ChannelList({
  types,
  onChannelPress,
  onCreatePress,
}: ChannelListProps) {
  const { styles } = useStyles();
  const { channels, loading, hasNextPage, loadMore } = useChannelsCollection({
    types,
    excludeArchives: true,
  });
  const { archiveChannel } = useChannelArchiveQuery();
  const archiveLabel = useString('amity_chat_archive');

  const renderArchiveAction = () => (
    <View style={styles.action}>
      <View style={styles.actionContent}>
        <AmityIcon
          name="arhive-r"
          size={ACTION_ICON_SIZE}
          tokenColor={AmityColorToken.IconSquareButtonDefaultSecondaryDefault}
        />
        <Typography variant="captionBold" style={styles.actionLabel}>
          {archiveLabel}
        </Typography>
      </View>
    </View>
  );

  // Mark the tapped channel read (clear its unread count) before navigating.
  // Uses the channel's default sub-channel; the SDK marks all its messages read.
  const handleRowPress = (channel: Amity.Channel) => {
    if (channel.defaultSubChannelId) {
      SubChannelRepository.startMessageReceiptSync(
        channel.defaultSubChannelId
      ).catch(() => {
        // Non-fatal: unread also clears when the conversation is opened.
      });
    }
    onChannelPress?.(channel.channelId, channel.displayName, channel.type);
  };

  const isInitialLoading = loading && channels.length === 0;

  if (isInitialLoading) {
    return (
      <View style={styles.list}>
        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
          <AmityChatListItem.Skeleton key={i} />
        ))}
      </View>
    );
  }

  if (channels.length === 0) {
    return <EmptyChannelList onCreatePress={onCreatePress} />;
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={channels}
      keyExtractor={(channel) => channel.channelId}
      renderItem={({ item }) => (
        <Swipeable
          renderRightActions={renderArchiveAction}
          onSwipeableWillOpen={() =>
            archiveChannel({ channelId: item.channelId })
          }
        >
          <View style={styles.row}>
            <AmityChatListItem
              channel={item}
              onPress={() => handleRowPress(item)}
            />
          </View>
        </Swipeable>
      )}
      onEndReachedThreshold={0.7}
      onEndReached={() => {
        if (hasNextPage) loadMore();
      }}
      ListFooterComponent={hasNextPage ? <AmityChatListItem.Skeleton /> : null}
    />
  );
}

function EmptyChannelList({ onCreatePress }: { onCreatePress?: () => void }) {
  const { styles, token } = useStyles();
  const emptyTitle = useString('amity_chat_home_empty_title');
  const emptyDescription = useString('amity_chat_home_empty_description');
  const createNewChatLabel = useString('amity_chat_create_new_chat');

  return (
    <View style={styles.empty}>
      <AmityIcon
        name="comments-alt-r"
        size={48}
        color={token(AmityColorToken.IconEmptyStateIconDefault)}
      />
      <View style={styles.emptyContent}>
        <View style={styles.emptyText}>
          <Typography variant="titleBold" style={styles.emptyTitle}>
            {emptyTitle}
          </Typography>
          <Typography variant="caption" style={styles.emptySubtitle}>
            {emptyDescription}
          </Typography>
        </View>
        <Button
          label={createNewChatLabel}
          icon="plus-r"
          onPress={onCreatePress}
        />
      </View>
    </View>
  );
}
