// ArchivedChannelList — ported from AmityUiKitWeb
// v4/chat/features/archive/components/ArchivedChannelList.
// A live list of the active user's archived channels, each row swipeable to
// unarchive.
//
// RN adaptations from web:
//   - Web's IntersectionObserver sentinel → FlatList `onEndReached`.
//   - Web wraps each ChannelItem in `SwipeToLeft` (framer-motion). That helper
//     is a skipped legacy unit in RN, so the swipe-to-unarchive interaction is
//     rebuilt with react-native-gesture-handler's `Swipeable`
//     (`renderRightActions` + `onSwipeableWillOpen` → unarchive). The action's
//     visual tokens are ported from SwipeToLeft.module.css. NOTE: the swipe only
//     responds when `GestureHandlerRootView` is mounted at the app root.
//   - Web's ChannelItem self-navigates via ChatNavigation context; here the row
//     `onPress` navigates through React Navigation (typed `any`, mirroring
//     AmityChatHomePage) so tapping a row opens the chat.
//   - Reuses the RN `AmityChatListItem` (consumed, never modified).

// 1. React / RN imports
import { FlatList, View } from 'react-native';

// 2. Third-party imports
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import { Typography } from '../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import { AmityChatListItem } from '../../../../components/AmityChatListItem';
import { EmptyState } from '../../../../features/shared/components/EmptyState';
import { useArchivedChannelsCollection } from '../../../../hooks/collections/useArchivedChannelsCollection';
import { useChannelArchiveQuery } from '../../../../hooks/queries';
import { useStyles } from './styles';

const LIST_PAGE_LIMIT = 20;
const LIST_SKELETON_ROW_COUNT = 9;
const ACTION_ICON_SIZE = 28;

// 4. Named function component
export function ArchivedChannelList() {
  const { styles } = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { unarchiveChannel } = useChannelArchiveQuery();
  const unarchiveLabel = useString('amity_chat_unarchive');

  const { channels, loading, hasNextPage, loadMore } =
    useArchivedChannelsCollection({ limit: LIST_PAGE_LIMIT });

  const isInitialLoading = loading && channels.length === 0;

  async function handleUnarchive(channelId: string) {
    await unarchiveChannel({ channelId });
  }

  function handleOpen(channel: Amity.Channel) {
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

  if (isInitialLoading) {
    return (
      <View style={styles.archivedChannelList}>
        {Array.from({ length: LIST_SKELETON_ROW_COUNT }).map((_, i) => (
          <AmityChatListItem.Skeleton key={i} />
        ))}
      </View>
    );
  }

  if (channels.length === 0) {
    return (
      <View style={styles.archivedChannelList}>
        <EmptyState variant="no-archived-chats" />
      </View>
    );
  }

  const renderRightAction = () => (
    <View style={styles.action}>
      <View style={styles.actionContent}>
        <AmityIcon
          name="unarhive-r"
          size={ACTION_ICON_SIZE}
          tokenColor={AmityColorToken.IconSquareButtonDefaultSecondaryDefault}
        />
        <Typography variant="captionBold" style={styles.actionLabel}>
          {unarchiveLabel}
        </Typography>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.archivedChannelList}
      contentContainerStyle={styles.listContent}
      data={channels}
      keyExtractor={(channel) => channel.channelId}
      renderItem={({ item }) => (
        <Swipeable
          renderRightActions={renderRightAction}
          onSwipeableWillOpen={() => handleUnarchive(item.channelId)}
        >
          <View style={styles.row}>
            <AmityChatListItem
              channel={item}
              onPress={() => handleOpen(item)}
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
