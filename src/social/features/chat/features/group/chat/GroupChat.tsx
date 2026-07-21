// GroupChat — the group conversation container, ported from AmityUiKitWeb
// group/chat/GroupChat. Same shared thread infra as the 1-1 Chat (MessageList,
// composer, viewers, action menu, see-more), driven by useGroupChat. Adds a group
// Header (→ settings) and a banned empty-state branch.

import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { AmityMessageComposer } from '../../../components/AmityMessageComposer';
import { ImageViewer } from '../../shared/components/ImageViewer';
import { VideoPlayer } from '../../shared/components/VideoPlayer';
import { MessageFullTextScreen } from '../../shared/components/MessageFullTextScreen';
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
    </KeyboardAvoidingView>
  );
}
