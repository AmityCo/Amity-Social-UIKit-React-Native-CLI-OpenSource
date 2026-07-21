// AmityMessageComposer — RN match of AmityUiKitWeb
// v4/chat/features/shared/components/MessageComposer/MessageComposer. Takes a
// `composer` object (= ReturnType<typeof useMessageComposer>) plus the overlay
// openers, and renders the media section + edit panel + reply band + TextEditor.
// All orchestration (text/canSend/send/edit/reply/media/mentions) lives in the
// composer object; this component is pure view + input wiring.
//
// RN specifics vs web:
//  - Web mounts a Lexical contentEditable TextEditor with initialText /
//    onMentionsChanged and a portal for mention suggestions. RN's TextEditor is
//    a controlled multiline TextInput; mention segments live inside it and are
//    synced back into composer.editorMentions on each change (mapping
//    MentionSegment → web Mentioned), so composer.handleSendText stays faithful.
//    Web's MediaSection (hidden <input>/FileTrigger) → the RN
//    AmityMediaAttachmentPicker (react-native-image-picker Asset).

// 1. React / RN imports
import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

// 2. Third-party imports
import { Client } from '@amityco/ts-sdk-react-native';

// 3. Internal imports
import {
  TextEditor,
  type TextEditorHandle,
} from '../../../../../core/design/components/TextEditor';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { Typography } from '../../../../../core/design/components/Typography';
import { useString } from '../../../../../core/localization';
import { useMention } from '../../hooks/useMention';
import { MessageReplyBand } from '../../features/shared/components/MessageReplyBand';
import { AmityMediaAttachmentPicker } from '../AmityMediaAttachmentPicker';
import type { useMessageComposer } from '../../features/shared/hooks/useMessageComposer';
import { useStyles } from './styles';

// 4. Types
type MessageComposer = ReturnType<typeof useMessageComposer>;

type AmityMessageComposerProps = {
  composer: MessageComposer;
  onOpenSeeMore: (text: string, title?: string) => void;
  onOpenImage: (url: string, message: Amity.Message) => void;
  onOpenVideo: (message: Amity.Message) => void;
};

// 5. Named function component
export function AmityMessageComposer({
  composer,
  onOpenSeeMore,
  onOpenImage,
  onOpenVideo,
}: AmityMessageComposerProps) {
  const {
    subChannelId,
    enableMention,
    text,
    setText,
    canSend,
    isEditing,
    editingMessageId,
    setEditorMentions,
    cancelEdit,
    replyTo,
    cancelReply,
    showMediaSection,
    toggleMediaSection,
    collapseMediaSection,
    handleSendText,
    handleSelectMedia,
  } = composer;

  const { styles, placeholderColor } = useStyles();
  const editorRef = useRef<TextEditorHandle>(null);
  const placeholder = useString('amity_chat_composer_placeholder');
  const editingLabel = useString('amity_chat_editing_message');

  const currentUserId = Client.getCurrentUser()?.userId;

  const { query, setQuery, suggestions, reset, toMention } = useMention({
    channelId: subChannelId,
    includeChannelMention: enableMention,
  });

  const showMentions =
    enableMention && query !== null && suggestions.length > 0;

  function onToggle() {
    if (!showMediaSection) {
      editorRef.current?.blur();
    } else {
      editorRef.current?.focus();
    }
    toggleMediaSection();
  }

  async function onSend() {
    if (!canSend) return;
    if (!isEditing) {
      editorRef.current?.clear();
    }
    reset();
    await handleSendText();
  }

  function onTextChanged(value: string) {
    setText(value);
    if (value.length > 0 && showMediaSection) {
      collapseMediaSection();
    }
    // Keep composer.editorMentions in sync with the editor's tracked segments so
    // handleSendText builds the correct mentionees/metadata (web parity).
    if (enableMention) {
      const segments = editorRef.current?.getMentioned() ?? [];
      setEditorMentions(
        segments.map((s) => ({
          userId: s.userId,
          length: s.length,
          index: s.index,
          type: s.type,
          displayName: s.display,
        }))
      );
    }
  }

  function handlePickMention(suggestion: (typeof suggestions)[number]) {
    editorRef.current?.insertMention(toMention(suggestion));
    reset();
  }

  return (
    <View style={styles.container}>
      {isEditing ? (
        <View style={styles.editPanel}>
          <View style={styles.editPanelInfo}>
            <AmityIcon
              name="pen-r"
              size={20}
              tokenColor={AmityColorToken.TextBaseSubdue}
            />
            <Typography variant="captionBold" style={styles.editPanelLabel}>
              {editingLabel}
            </Typography>
          </View>
          <Pressable
            style={styles.editPanelClose}
            onPress={cancelEdit}
            accessibilityRole="button"
            accessibilityLabel="Cancel edit"
          >
            <AmityIcon
              name="cross-r"
              size={20}
              tokenColor={AmityColorToken.TextBaseSubdue}
            />
          </Pressable>
        </View>
      ) : null}

      {!isEditing && replyTo ? (
        <MessageReplyBand
          replyTo={replyTo}
          currentUserId={currentUserId}
          onCancel={cancelReply}
          onOpenSeeMore={onOpenSeeMore}
          onOpenImage={onOpenImage}
          onOpenVideo={onOpenVideo}
        />
      ) : null}

      {showMentions ? (
        <View style={styles.mentionOverlay}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.userId}
                style={styles.mentionItem}
                onPress={() => handlePickMention(suggestion)}
                accessibilityRole="button"
              >
                <Text style={styles.mentionItemText}>
                  @{suggestion.display}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        {isEditing ? null : (
          <Pressable
            style={styles.iconButton}
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel="Attach media"
            accessibilityState={{ expanded: showMediaSection }}
          >
            <AmityIcon
              name={showMediaSection ? 'cross-r' : 'plus-r'}
              size={24}
              tokenColor={AmityColorToken.IconIconButtonFilledSecondaryDefault}
            />
          </Pressable>
        )}

        <TextEditor
          key={editingMessageId ?? 'create'}
          ref={editorRef}
          value={text}
          onChangeText={onTextChanged}
          onSend={onSend}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          autoFocus={isEditing}
          onMentionQueryChange={enableMention ? setQuery : undefined}
        />

        {showMediaSection ? null : (
          <Pressable
            style={[styles.sendButton, canSend && styles.sendButtonEnabled]}
            onPress={onSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <AmityIcon
              name="arrow-up-r"
              size={24}
              tokenColor={
                canSend
                  ? AmityColorToken.IconIconButtonFilledPrimaryDefault
                  : AmityColorToken.IconIconButtonFilledSecondaryDisabled
              }
            />
          </Pressable>
        )}
      </View>

      {!isEditing && showMediaSection ? (
        <AmityMediaAttachmentPicker onPickAsset={handleSelectMedia} />
      ) : null}
    </View>
  );
}
