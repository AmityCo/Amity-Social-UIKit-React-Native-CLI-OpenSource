// MessageReactorListSheet — RN port of AmityUiKitWeb
// v4/chat/features/shared/components/MessageReactorListSheet/MessageReactorListSheet.tsx.
// The reactor list shown in a bottom sheet: an underlined tab per distinct
// reaction (plus an "All" tab), each listing who reacted. This renders the sheet
// CONTENT only — the orchestrator mounts it inside the repo's @devvie bottom
// sheet with the same `messageId` + `onClose` contract web's useBubbleMenu uses.
//
// RN adaptations from web:
//   - Live message via MessageRepository.getMessage (web useMessageObject).
//   - Reactor pagination via useReactorsCollection (web useReactionsCollection);
//     IntersectionObserver → FlatList onEndReached.
//   - The RN Tab atom's underlined variant renders a string label only and can't
//     host web's icon+count node label, so the tab bar is rendered inline reusing
//     the SoT underlined-tab tokens/geometry.

// 1. React / RN imports
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import {
  FileRepository,
  MessageRepository,
} from '@amityco/ts-sdk-react-native';

// 2. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import { Skeleton } from '../../../../../../../core/design/components/Skeleton';
import { Avatar } from '../../../../../../../core/design/atoms/Avatar';
import { useString } from '../../../../../../../core/localization';
import { abbreviateCount } from '../../../../../../../core/utils/abbreviateCount';
import { useCurrentUserId } from '../../../../hooks/useCurrentUserId';
import { useMessageReactions } from '../../hooks/useMessageReactions';
import { useReactorsCollection } from '../../hooks/useReactorsCollection';
import { ReactionGlyph, SmilePlus } from '../../utils/reactionIcons';
import { useStyles } from './styles';

// 3. Types
type MessageReactorListSheetProps = {
  messageId: string;
  onClose: () => void;
};

const ALL_TAB = 'all' as const;

// 4. Named function component
export function MessageReactorListSheet({
  messageId,
  onClose,
}: MessageReactorListSheetProps) {
  const { styles } = useStyles();
  const currentUserId = useCurrentUserId();
  const { removeReaction } = useMessageReactions();
  const allTabLabel = useString('amity_chat_tab_all');

  // Live message (web useMessageObject).
  const [currentMessage, setCurrentMessage] = useState<Amity.Message | null>(
    null
  );
  useEffect(() => {
    const unsubscribe = MessageRepository.getMessage(messageId, (result) => {
      setCurrentMessage(result.data ?? null);
    });
    return () => unsubscribe();
  }, [messageId]);

  const isMessageDeleted = !!currentMessage?.isDeleted;
  const reactionMap =
    (currentMessage?.reactions as Record<string, number> | undefined) ?? {};
  const totalCount = isMessageDeleted ? 0 : currentMessage?.reactionsCount ?? 0;

  const distinctNames = useMemo(() => {
    if (isMessageDeleted) return [];
    return Object.entries(reactionMap)
      .filter(([, count]) => count > 0)
      .sort((a, b) => (a[1] === b[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]))
      .map(([name]) => name);
  }, [currentMessage?.reactions, isMessageDeleted]);

  const [activeTab, setActiveTab] = useState<string>(
    distinctNames.length > 1 ? ALL_TAB : distinctNames[0] ?? ALL_TAB
  );

  useEffect(() => {
    if (activeTab === ALL_TAB) return;
    if (distinctNames.includes(activeTab)) return;
    setActiveTab(
      distinctNames.length > 1 ? ALL_TAB : distinctNames[0] ?? ALL_TAB
    );
  }, [activeTab, distinctNames]);

  const { reactors, isLoading, isLoadingFirstPage, hasMore, loadMore } =
    useReactorsCollection({
      referenceType: 'message',
      referenceId: messageId,
      limit: 25,
      ...(activeTab !== ALL_TAB ? { reactionName: activeTab } : {}),
    });

  const myReactor = useMemo(() => {
    if (!currentUserId) return null;
    return reactors.find((r) => r.userId === currentUserId) ?? null;
  }, [reactors, currentUserId]);

  const others = useMemo(
    () => (myReactor ? reactors.filter((r) => r !== myReactor) : reactors),
    [reactors, myReactor]
  );

  async function handleOwnRowPress() {
    if (!myReactor || !currentMessage) return;
    onClose();
    await removeReaction({
      message: currentMessage,
      reactionName: myReactor.reactionName,
    });
  }

  const rows = useMemo(() => {
    const list: { reactor: Amity.Reactor; isOwn: boolean }[] = [];
    if (myReactor) list.push({ reactor: myReactor, isOwn: true });
    for (const r of others) list.push({ reactor: r, isOwn: false });
    return list;
  }, [myReactor, others]);

  // Tab items (web `tabs()`).
  const tabItems: { value: string; icon?: ReactNode; text: string }[] = [];
  const showAllTab = distinctNames.length === 0 || distinctNames.length > 1;
  if (showAllTab) {
    tabItems.push({
      value: ALL_TAB,
      text: `${allTabLabel} ${abbreviateCount(totalCount)}`,
    });
  }
  for (const name of distinctNames) {
    tabItems.push({
      value: name,
      icon: <ReactionGlyph name={name} size={20} />,
      text: `${abbreviateCount(reactionMap[name] ?? 0)}`,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabList}>
        {tabItems.map((t) => {
          const active = activeTab === t.value;
          return (
            <Pressable
              key={t.value}
              style={styles.tab}
              onPress={() => setActiveTab(t.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <View style={styles.tabLabel}>
                {t.icon}
                <Typography
                  style={[
                    styles.tabLabelText,
                    active
                      ? styles.tabLabelTextActive
                      : styles.tabLabelTextDefault,
                  ]}
                >
                  {t.text}
                </Typography>
              </View>
              <View
                style={[
                  styles.tabIndicator,
                  active && styles.tabIndicatorActive,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {totalCount === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, index) =>
            `${item.reactor.userId ?? 'unknown'}-${index}`
          }
          renderItem={({ item }) => (
            <ReactorRow
              reactor={item.reactor}
              isOwn={item.isOwn}
              onPress={item.isOwn ? handleOwnRowPress : undefined}
            />
          )}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasMore && !isLoading && !isLoadingFirstPage) loadMore();
          }}
          ListFooterComponent={
            isLoadingFirstPage || isLoading ? <SkeletonRows count={3} /> : null
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

// --- Reactor row -------------------------------------------------------------
type ReactorRowProps = {
  reactor: Amity.Reactor;
  isOwn?: boolean;
  onPress?: () => void;
};

function ReactorRow({ reactor, isOwn = false, onPress }: ReactorRowProps) {
  const { styles } = useStyles();
  const tapToRemoveLabel = useString(
    'amity_common_button_tap_to_remove_reaction'
  );
  const displayName = reactor.user?.displayName ?? reactor.user?.userId ?? '';
  const avatarFileUrl = (
    reactor.user?.avatar as { fileUrl?: string } | undefined
  )?.fileUrl;
  const imageUrl = avatarFileUrl
    ? FileRepository.fileUrlWithSize(avatarFileUrl, 'small')
    : undefined;

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isOwn ? tapToRemoveLabel : displayName}
    >
      {reactor.user && (
        <Avatar
          variant={imageUrl ? 'image' : 'text'}
          shape="rounded"
          size={32}
          imageUrl={imageUrl}
          initials={displayName.trim().charAt(0).toUpperCase() || '?'}
        />
      )}
      <View style={styles.rowText}>
        <Typography variant="bodyBold" style={styles.rowTitle}>
          {reactor.user?.displayName ?? ''}
        </Typography>
        {isOwn ? (
          <Typography variant="caption" style={styles.rowCaption}>
            {tapToRemoveLabel}
          </Typography>
        ) : null}
      </View>
      <ReactionGlyph name={reactor.reactionName} size={24} />
    </Pressable>
  );
}

// --- Empty state -------------------------------------------------------------
function EmptyState() {
  const { styles, emptyStateIconColor } = useStyles();
  const title = useString('amity_common_button_no_reactions_yet');
  const description = useString(
    'amity_common_label_be_first_to_react',
    'message'
  );
  return (
    <View style={styles.emptyState}>
      <SmilePlus size={48} color={emptyStateIconColor} />
      <View style={styles.emptyStateText}>
        <Typography variant="titleBold" style={styles.emptyStateTitle}>
          {title}
        </Typography>
        <Typography variant="caption" style={styles.emptyStateDescription}>
          {description}
        </Typography>
      </View>
    </View>
  );
}

// --- Skeleton rows -----------------------------------------------------------
function SkeletonRows({ count }: { count: number }) {
  const { styles } = useStyles();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton circle width={40} height={40} />
          <Skeleton width={140} height={10} borderRadius={12} />
        </View>
      ))}
    </>
  );
}
