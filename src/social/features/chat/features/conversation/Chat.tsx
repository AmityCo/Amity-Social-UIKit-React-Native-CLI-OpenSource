// Chat — the conversation thread container, a faithful port of AmityUiKitWeb
// v4/chat/features/conversation/chat/Chat. All orchestration lives in useConversation
// (→ useChatMessage); this component only wires the returned values into the
// components with the same props web uses: Header, WaitingForNetwork, MessageList,
// MutedBanner|MessageComposer, ImageViewer, VideoPlayer, MessageFullTextScreen.

// 1. React / RN imports
import { Dimensions, KeyboardAvoidingView, Platform, View } from 'react-native';

// 2. Internal imports
import useFile from '../../../../../core/hooks/useFile';
import { useBottomSheet } from '../../../../../core/stores/slices/bottomSheetSlice';
import { AmityMessageComposer } from '../../components/AmityMessageComposer';
import { AmityConversationChatUserActionComponent } from '../../components/AmityConversationChatUserActionComponent';
import { ImageViewer } from '../shared/components/ImageViewer';
import { VideoPlayer } from '../shared/components/VideoPlayer';
import { MessageFullTextScreen } from '../shared/components/MessageFullTextScreen';
import { ContentReportReason } from '../shared/components/ContentReportReason';
import { MessageReactorListSheet } from '../shared/components/MessageReactorListSheet';
import { MutedBanner } from '../shared/components/MutedBanner';
import { WaitingForNetwork } from '../../elements/WaitingForNetwork';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { useConversation } from './hooks/useConversation';
import { useStyles } from './styles';

// 3. Types
export type ChatProps = {
  channelId?: string;
  userDisplayName?: string;
  onBack: () => void;
};

// 4. Named function component
export function Chat({ channelId, userDisplayName, onBack }: ChatProps) {
  const { styles } = useStyles();
  const c = useConversation(channelId);

  // Receiver avatar for the header (1-1 conversation), resolved from the other
  // participant's avatarFileId — the same source AmityChatListItem uses for the
  // list row (kept consistent so both show the same image).
  const otherUserAvatarUrl = useFile({
    fileId: c.otherUser?.avatarFileId ?? '',
  });
  // Reactor-list sheet — web keeps this in useBubbleMenu at the orchestration
  // level (one instance). RN MOBILE ADAPTATION: rather than render the reactor
  // list inline, push it into the repo's global @devvie bottom sheet so it slides
  // up as a sheet with a backdrop + drag/tap-to-close (BUG #15).
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        // A 1-1 conversation's title is the OTHER participant's display name, not
        // the channel's displayName (which is often empty for conversations).
        // Resolve it from the channel's preview members (same as AmityChatListItem);
        // fall back to the navigation-passed name only while that loads.
        title={c.otherUser?.displayName || userDisplayName || ''}
        avatarUrl={otherUserAvatarUrl}
        onBack={onBack}
        trailing={
          c.otherUser ? (
            <AmityConversationChatUserActionComponent
              user={c.otherUser}
              channelId={channelId ?? ''}
            />
          ) : undefined
        }
      />
      <WaitingForNetwork />
      <View style={{ flex: 1 }}>
        <MessageList
          items={c.items}
          currentUserId={c.currentUserId}
          isGroupChat={c.isGroupChat}
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
          pendingUploads={c.composer.pendingUploads}
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
