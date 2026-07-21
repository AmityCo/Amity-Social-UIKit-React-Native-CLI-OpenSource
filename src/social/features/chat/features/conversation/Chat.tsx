// Chat — the conversation thread container, a faithful port of AmityUiKitWeb
// v4/chat/features/conversation/chat/Chat. All orchestration lives in useConversation
// (→ useChatMessage); this component only wires the returned values into the
// components with the same props web uses: Header, WaitingForNetwork, MessageList,
// MutedBanner|MessageComposer, ImageViewer, VideoPlayer, MessageFullTextScreen.

// 1. React / RN imports
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

// 2. Internal imports
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { AmityMessageComposer } from '../../components/AmityMessageComposer';
import { AmityConversationChatUserActionComponent } from '../../components/AmityConversationChatUserActionComponent';
import { ImageViewer } from '../shared/components/ImageViewer';
import { VideoPlayer } from '../shared/components/VideoPlayer';
import { MessageFullTextScreen } from '../shared/components/MessageFullTextScreen';
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
  // level (one instance). RN holds the target messageId here and renders one sheet.
  const [reactorMessageId, setReactorMessageId] = useState<string | null>(null);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title={userDisplayName ?? ''}
        onBack={onBack}
        trailing={
          c.otherUser ? (
            <AmityConversationChatUserActionComponent
              user={c.otherUser}
              placement="bottom right"
              anchor={({ openPopover }) => (
                <Pressable
                  onPress={openPopover}
                  accessibilityRole="button"
                  accessibilityLabel="Conversation actions"
                >
                  <AmityIcon
                    name="ellipsis-v-r"
                    size={24}
                    tokenColor={
                      AmityColorToken.IconIconButtonGhostSecondaryDefault
                    }
                  />
                </Pressable>
              )}
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
          onOpenReactorList={(m) => setReactorMessageId(m.messageId)}
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
      {reactorMessageId ? (
        <MessageReactorListSheet
          messageId={reactorMessageId}
          onClose={() => setReactorMessageId(null)}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}
