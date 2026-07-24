// Chat — the conversation thread container, a faithful port of AmityUiKitWeb
// v4/chat/features/conversation/chat/Chat. All orchestration lives in useConversation
// (→ useChatMessage); this component only wires the returned values into the
// components with the same props web uses: Header, WaitingForNetwork, MessageList,
// MutedBanner|MessageComposer, ImageViewer, VideoPlayer, MessageFullTextScreen.

// 1. React / RN imports
import { Dimensions, KeyboardAvoidingView, Platform, View } from 'react-native';

// 2. Internal imports
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
  // Reactor-list sheet — web keeps this in useBubbleMenu at the orchestration
  // level (one instance). RN MOBILE ADAPTATION: rather than render the reactor
  // list inline, push it into the repo's global @devvie bottom sheet so it slides
  // up as a sheet with a backdrop + drag/tap-to-close (BUG #15).
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  function openReactorList(message: Amity.Message) {
    openBottomSheet({
      // Tall drawer — web presents this list in a ~90vh drawer.
      height: Math.round(Dimensions.get('window').height * 0.7),
      content: (
        <MessageReactorListSheet
          messageId={message.messageId}
          initialMessage={message}
          onClose={closeBottomSheet}
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
