// GroupChat — the group conversation container, ported from AmityUiKitWeb
// group/chat/GroupChat. Same shared thread infra as the 1-1 Chat (MessageList,
// composer, viewers, action menu, see-more), driven by useGroupChat. Adds a group
// Header (→ settings) and a banned empty-state branch.

import { Dimensions, KeyboardAvoidingView, Platform, View } from 'react-native';

import { useBottomSheet } from '../../../../../../core/stores/slices/bottomSheetSlice';
import { AmityMessageComposer } from '../../../components/AmityMessageComposer';
import { ImageViewer } from '../../shared/components/ImageViewer';
import { VideoPlayer } from '../../shared/components/VideoPlayer';
import { MessageFullTextScreen } from '../../shared/components/MessageFullTextScreen';
import { ContentReportReason } from '../../shared/components/ContentReportReason';
import { MessageReactorListSheet } from '../../shared/components/MessageReactorListSheet';
import { MutedBanner } from '../../shared/components/MutedBanner';
import { WaitingForNetwork } from '../../../elements/WaitingForNetwork';
import { MessageList } from '../../conversation/components/MessageList';
import { Header } from './components/Header';
import { BannedEmptyState } from './components/BannedEmptyState';
import { useGroupChat } from './hooks/useGroupChat';
import { useStyles } from './styles';

export type GroupChatProps = {
  channelId?: string;
  isJustCreated?: boolean;
  onBack: () => void;
};

export function GroupChat({
  channelId,
  isJustCreated,
  onBack,
}: GroupChatProps) {
  const { styles } = useStyles();
  const c = useGroupChat({ channelId, isJustCreated });
  // Reactor-list sheet — RN MOBILE ADAPTATION: push the reactor list into the
  // repo's global @devvie bottom sheet so it slides up as a sheet with a backdrop
  // + drag/tap-to-close (BUG #15).
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  function openReactorList(message: Amity.Message) {
    // Tall drawer — web presents this list in a ~90vh drawer. The sheet content
    // needs an explicit height (see MessageReactorListSheet: @devvie's inner
    // wrapper is auto-height, so a flex child collapses), so pass it down too.
    const reactorSheetHeight = Math.round(
      Dimensions.get('window').height * 0.7
    );
    openBottomSheet({
      height: reactorSheetHeight,
      content: (
        <MessageReactorListSheet
          messageId={message.messageId}
          initialMessage={message}
          onClose={closeBottomSheet}
          sheetHeight={reactorSheetHeight}
        />
      ),
    });
  }

  if (c.isBanned) {
    return (
      <View style={styles.container}>
        <Header
          variant="banned"
          channel={c.channel}
          channelDisplayName={c.channelDisplayName}
          onBack={onBack}
          onOpenSettings={c.handleOpenSettings}
        />
        <BannedEmptyState />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        channel={c.channel}
        channelDisplayName={c.channelDisplayName}
        onBack={onBack}
        onOpenSettings={c.handleOpenSettings}
      />
      <WaitingForNetwork />
      <View style={{ flex: 1 }}>
        <MessageList
          items={c.items}
          currentUserId={c.currentUserId}
          isGroupChat
          hasMore={c.hasMore}
          onLoadMore={c.loadMore}
          atBottom={c.atBottom}
          onAtBottomChange={c.setAtBottom}
          newMessage={c.newMessage}
          onClearNewMessage={c.clearNewMessage}
          onOpenImage={c.openImageViewer}
          onOpenVideo={c.openVideoPlayer}
          onOpenFailedSheet={c.openFailedSheet}
          onOpenBubbleMenu={c.openBubbleMenu}
          onOpenReactorList={(m) => openReactorList(m)}
          isLoading={c.isLoading}
          isLoadingFirstPage={c.isLoadingFirstPage}
          onSeeMore={c.openSeeMore}
          bubbleHandlers={{
            onEdit: c.handleBubbleEdit,
            onReply: c.handleBubbleReply,
            onDelete: c.handleBubbleDelete,
            onCopy: c.handleBubbleCopy,
            onSave: c.handleBubbleSave,
            onReport: c.handleBubbleReport,
          }}
        />
      </View>

      {c.showMutedBanner ? (
        <MutedBanner variant={c.mutedVariant} />
      ) : (
        <AmityMessageComposer
          composer={c.composer}
          onOpenSeeMore={c.openSeeMore}
          onOpenImage={c.openImageViewer}
          onOpenVideo={c.openVideoPlayer}
        />
      )}

      {c.imageViewerProps ? <ImageViewer {...c.imageViewerProps} /> : null}
      {c.videoPlayerProps ? <VideoPlayer {...c.videoPlayerProps} /> : null}
      {c.seeMore ? (
        <MessageFullTextScreen
          visible
          text={c.seeMore.text}
          title={c.seeMore.title}
          onClose={c.closeSeeMore}
        />
      ) : null}
      {c.reportMessage ? (
        <ContentReportReason
          visible
          message={c.reportMessage}
          onClose={c.closeReport}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}
