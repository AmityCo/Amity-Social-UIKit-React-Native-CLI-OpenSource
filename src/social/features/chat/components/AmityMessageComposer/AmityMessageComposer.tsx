// AmityMessageComposer — ported from AmityUiKitWeb features/shared/components/
// MessageComposer. Web builds on a contentEditable TextEditor; RN uses the
// controlled multiline TextEditor (src/core/design/components/TextEditor). This
// enhanced version adds: an "Editing message" panel, a mounted TextEditor with a
// mention suggestion overlay, and a `replyBand` slot injected by the reply
// feature (this component never hard-imports the reply band).

// 1. React / RN imports
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

// 2. Internal imports
import {
  TextEditor,
  type TextEditorHandle,
} from '../../../../../core/design/components/TextEditor';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { Typography } from '../../../../../core/design/components/Typography';
import { useString } from '../../../../../core/localization';
import { useMention } from '../../hooks/useMention';
import { useStyles } from './styles';

// 3. Types
type SendExtras = {
  mentionees?: (Amity.UserMention | Amity.ChannelMention)[];
};

type AmityMessageComposerProps = {
  onSend: (text: string, extras?: SendExtras) => void | Promise<void>;
  onAttach?: () => void;
  disabled?: boolean;
  /** Channel to scope mention member search to. */
  channelId?: string;
  /** Include the `@all` channel mention option in suggestions. */
  includeChannelMention?: boolean;
  /** Slot for a reply preview band, injected by the reply feature. */
  replyBand?: ReactNode;
  /** When set, the composer switches to edit mode for this message. */
  editingMessage?: Amity.Message | null;
  onCancelEdit?: () => void;
  onSubmitEdit?: (
    messageId: string,
    text: string,
    extras?: SendExtras
  ) => void | Promise<void>;
};

// 4. Named function component
export function AmityMessageComposer({
  onSend,
  onAttach,
  disabled = false,
  channelId,
  includeChannelMention = false,
  replyBand,
  editingMessage,
  onCancelEdit,
  onSubmitEdit,
}: AmityMessageComposerProps) {
  const { styles, placeholderColor } = useStyles();
  const [text, setText] = useState('');
  const editorRef = useRef<TextEditorHandle>(null);
  const placeholder = useString('amity_chat_composer_placeholder');
  const editingLabel = useString('amity_chat_editing_message');

  const { query, setQuery, suggestions, reset, toMention } = useMention({
    channelId,
    includeChannelMention,
  });

  const isEditing = !!editingMessage;

  // Prefill the editor when entering edit mode; clear it when leaving.
  useEffect(() => {
    if (editingMessage) {
      const existing =
        (editingMessage as Amity.Message<'text'>).data?.text ?? '';
      setText(existing);
    } else {
      setText('');
      editorRef.current?.clear();
    }
    reset();
  }, [editingMessage?.messageId]);

  const canSend = text.trim().length > 0 && !disabled;
  const showMentions = query !== null && suggestions.length > 0;

  async function handleSend() {
    if (!canSend) return;
    const value = text.trim();
    const mentionees = editorRef.current?.getMentionees();
    const extras: SendExtras = { mentionees };

    setText('');
    editorRef.current?.clear();
    reset();

    if (isEditing && editingMessage && onSubmitEdit) {
      await onSubmitEdit(editingMessage.messageId, value, extras);
    } else {
      await onSend(value, extras);
    }
  }

  function handlePickMention(suggestion: (typeof suggestions)[number]) {
    editorRef.current?.insertMention(toMention(suggestion));
    reset();
  }

  return (
    <View style={styles.container}>
      {replyBand}

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
            onPress={onCancelEdit}
            accessibilityRole="button"
          >
            <AmityIcon
              name="cross-r"
              size={20}
              tokenColor={AmityColorToken.TextBaseSubdue}
            />
          </Pressable>
        </View>
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
        <Pressable
          style={styles.iconButton}
          onPress={onAttach}
          disabled={disabled}
          accessibilityRole="button"
        >
          <AmityIcon
            name="plus-r"
            size={24}
            tokenColor={AmityColorToken.IconIconButtonFilledSecondaryDefault}
          />
        </Pressable>

        <TextEditor
          ref={editorRef}
          value={text}
          onChangeText={setText}
          onSend={handleSend}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          editable={!disabled}
          onMentionQueryChange={setQuery}
        />

        <Pressable
          style={[styles.sendButton, canSend && styles.sendButtonEnabled]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
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
      </View>
    </View>
  );
}
