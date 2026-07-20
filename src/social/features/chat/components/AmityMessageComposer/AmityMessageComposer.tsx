// AmityMessageComposer — ported from AmityUiKitWeb features/shared/components/MessageComposer.
// Web builds on a contentEditable TextEditor; RN uses a multiline TextInput. This is the
// spine version (type + send text, attach button present). Mentions, media section, edit
// panel and reply band are layered in later M2 tasks.

// 1. React / RN imports
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

// 2. Internal imports
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type AmityMessageComposerProps = {
  onSend: (text: string) => void | Promise<void>;
  onAttach?: () => void;
  disabled?: boolean;
};

// 4. Named function component
export function AmityMessageComposer({
  onSend,
  onAttach,
  disabled = false,
}: AmityMessageComposerProps) {
  const { styles, placeholderColor } = useStyles();
  const [text, setText] = useState('');
  const placeholder = useString('amity_chat_composer_placeholder');

  const canSend = text.trim().length > 0 && !disabled;

  async function handleSend() {
    if (!canSend) return;
    const value = text.trim();
    setText('');
    await onSend(value);
  }

  return (
    <View style={styles.container}>
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

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            multiline
            editable={!disabled}
          />
        </View>

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
