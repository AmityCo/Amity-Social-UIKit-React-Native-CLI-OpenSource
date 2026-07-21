// ChannelList — ported from AmityUiKitWeb v4/chat/features/home/components/ChannelList.
// Renders a live list of channels for the given types via an RN FlatList.
//
// RN adaptations from web:
//   - Web's IntersectionObserver sentinel → FlatList `onEndReached`.
//   - Swipe-to-archive and the archive query are dropped (out of scope for M1).
//   - The empty-state illustration (web-only) is replaced by an AmityIcon glyph.
//   - Navigation is delegated to `onChannelPress(channelId)` from the page.

// 1. React / RN imports
import { FlatList, View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../../core/design/components/Typography';
import { Button } from '../../../../../../../core/design/atoms/Button';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import { AmityChatListItem } from '../../../../components/AmityChatListItem';
import { useChannelsCollection } from '../../../../hooks/collections/useChannelsCollection';
import { useStyles } from './styles';

const SKELETON_ROW_COUNT = 9;

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
  });

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
        <AmityChatListItem
          channel={item}
          onPress={() =>
            onChannelPress?.(item.channelId, item.displayName, item.type)
          }
        />
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
