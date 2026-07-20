// Chat — the conversation thread container, ported from AmityUiKitWeb
// features/conversation/chat/Chat. Composes Header + WaitingForNetwork + MessageList
// + composer, and hosts the overlays the thread opens: the image/video viewers, the
// reply band, and (via MessageRow) the long-press action menu. Wires everything to
// the useConversation engine.

// 1. React / RN imports
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

// 2. Internal imports
import { AmityMessageComposer } from '../../components/AmityMessageComposer';
import { ImageViewer } from '../shared/components/ImageViewer';
import { VideoPlayer } from '../shared/components/VideoPlayer';
import { MessageReplyBand } from '../shared/components/MessageReplyBand';
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

type Viewer =
  | { type: 'image'; src: string; message: Amity.Message }
  | { type: 'video'; message: Amity.Message }
  | null;

// 4. Named function component
export function Chat({ channelId, userDisplayName, onBack }: ChatProps) {
  const { styles } = useStyles();
  const {
    messages,
    hasNextPage,
    loadMore,
    sendText,
    editText,
    removeMessage,
    currentUserId,
    isGroupChat,
  } = useConversation(channelId);

  const [viewer, setViewer] = useState<Viewer>(null);
  const [replyTo, setReplyTo] = useState<Amity.Message | null>(null);
  const [editing, setEditing] = useState<Amity.Message | null>(null);

  const openImage = (src: string, message: Amity.Message) =>
    setViewer({ type: 'image', src, message });
  const openVideo = (message: Amity.Message) =>
    setViewer({ type: 'video', message });

  const isOwn = (m?: Amity.Message | null) =>
    !!m && !!currentUserId && m.creatorId === currentUserId;

  const handleSend = async (
    text: string,
    extras?: { mentionees?: (Amity.UserMention | Amity.ChannelMention)[] }
  ) => {
    await sendText(text, { ...extras, parentId: replyTo?.messageId });
    setReplyTo(null);
  };

  const handleSubmitEdit = async (
    messageId: string,
    text: string,
    extras?: { mentionees?: (Amity.UserMention | Amity.ChannelMention)[] }
  ) => {
    await editText(messageId, text, extras);
    setEditing(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={userDisplayName ?? ''} onBack={onBack} />
      <WaitingForNetwork />
      <View style={{ flex: 1 }}>
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isGroupChat={isGroupChat}
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          onOpenImage={openImage}
          onOpenVideo={openVideo}
          onReplyMessage={setReplyTo}
          onEditMessage={setEditing}
          onDeleteMessage={(m) => removeMessage(m.messageId)}
        />
      </View>
      <AmityMessageComposer
        onSend={handleSend}
        channelId={channelId}
        includeChannelMention={isGroupChat}
        editingMessage={editing}
        onCancelEdit={() => setEditing(null)}
        onSubmitEdit={handleSubmitEdit}
        replyBand={
          replyTo ? (
            <MessageReplyBand
              replyTo={replyTo}
              currentUserId={currentUserId}
              onCancel={() => setReplyTo(null)}
              onOpenSeeMore={() => {}}
              onOpenImage={openImage}
              onOpenVideo={openVideo}
            />
          ) : undefined
        }
      />

      {viewer?.type === 'image' ? (
        <ImageViewer
          src={viewer.src}
          isOwn={isOwn(viewer.message)}
          onClose={() => setViewer(null)}
        />
      ) : null}
      {viewer?.type === 'video' ? (
        <VideoPlayer
          message={viewer.message}
          isOwn={isOwn(viewer.message)}
          onClose={() => setViewer(null)}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}
