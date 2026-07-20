// Chat — the conversation thread container, ported from AmityUiKitWeb
// features/conversation/chat/Chat. Composes Header + MessageList + composer and
// wires them to the useConversation engine. Media viewers, action popover, muted
// banner and reply/mention layer on in later M2 tasks.

// 1. React / RN imports
import { KeyboardAvoidingView, Platform, View } from 'react-native';

// 2. Internal imports
import { AmityMessageComposer } from '../../components/AmityMessageComposer';
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
  const {
    messages,
    hasNextPage,
    loadMore,
    sendText,
    currentUserId,
    isGroupChat,
  } = useConversation(channelId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={userDisplayName ?? ''} onBack={onBack} />
      <View style={{ flex: 1 }}>
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isGroupChat={isGroupChat}
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
        />
      </View>
      <AmityMessageComposer onSend={sendText} />
    </KeyboardAvoidingView>
  );
}
