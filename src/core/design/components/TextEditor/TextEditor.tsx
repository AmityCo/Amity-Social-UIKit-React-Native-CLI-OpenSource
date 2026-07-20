// TextEditor — RN equivalent of AmityUiKitWeb core/design/components/TextEditor.
// Web is a 646-line Lexical contentEditable editor (mentions, hashtags, links,
// products). RN has no contentEditable, so this is a controlled multiline
// TextInput that owns the plain-text authority plus lightweight mention
// tracking. It exposes an imperative handle (focus/blur/clear/insertMention +
// getters for the SDK payload) and a render slot for the mention overlay.
//
// Deliberately NOT ported: hashtags, product mentions, URL/link detection,
// character-limit plugins, floating link editor. Mention position tracking is
// best-effort (see utils.reconcileMentions).

// 1. React / RN imports
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';

// 2. Internal imports
import { useStyles } from './styles';
import {
  detectMentionQuery,
  insertMentionToken,
  reconcileMentions,
  toMentionees,
  type MentionSegment,
} from './utils';

// 3. Types
export type TextEditorHandle = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  insertMention: (mention: {
    userId: string;
    display: string;
    type?: 'user' | 'channel';
  }) => void;
  getText: () => string;
  getMentioned: () => MentionSegment[];
  getMentionees: () => (Amity.UserMention | Amity.ChannelMention)[];
};

export type TextEditorProps = {
  value: string;
  onChangeText: (text: string) => void;
  /** Called on submit (return key / send). */
  onSend?: () => void;
  placeholder?: string;
  placeholderTextColor?: string;
  editable?: boolean;
  autoFocus?: boolean;
  maxHeight?: number;
  /**
   * Fires whenever the active `@query` at the caret changes. `null` means the
   * caret is not inside a mention token — the consumer should hide the overlay.
   */
  onMentionQueryChange?: (query: string | null) => void;
  /** Slot rendered above the input (the mention suggestion list). */
  mentionOverlay?: ReactNode;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
};

// 4. Named function component (forwardRef for the imperative handle)
export const TextEditor = forwardRef<TextEditorHandle, TextEditorProps>(
  function TextEditor(
    {
      value,
      onChangeText,
      onSend,
      placeholder,
      placeholderTextColor,
      editable = true,
      autoFocus = false,
      maxHeight = 120,
      onMentionQueryChange,
      mentionOverlay,
      style,
    },
    ref
  ) {
    const { styles, placeholderColor } = useStyles();
    const inputRef = useRef<TextInput>(null);

    // TextEditor is the text authority: previous value + committed mentions are
    // kept in refs so edits reconcile without extra renders.
    const prevValueRef = useRef(value);
    const mentionsRef = useRef<MentionSegment[]>([]);
    const caretRef = useRef(value.length);

    // Controlled selection is only driven imperatively (after insertMention);
    // otherwise we leave it undefined so the native caret behaves normally.
    const [selection, setSelection] = useState<
      { start: number; end: number } | undefined
    >(undefined);

    const emitQuery = useCallback(
      (text: string, caret: number) => {
        if (!onMentionQueryChange) return;
        const active = detectMentionQuery(text, caret);
        onMentionQueryChange(active ? active.query : null);
      },
      [onMentionQueryChange]
    );

    const handleChangeText = useCallback(
      (nextText: string) => {
        mentionsRef.current = reconcileMentions(
          prevValueRef.current,
          nextText,
          mentionsRef.current
        );
        prevValueRef.current = nextText;
        // Native controlled selection resets after our programmatic set; clear it.
        setSelection(undefined);
        onChangeText(nextText);
        emitQuery(nextText, caretRef.current);
      },
      [onChangeText, emitQuery]
    );

    const handleSelectionChange = useCallback(
      (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
        caretRef.current = e.nativeEvent.selection.start;
        emitQuery(prevValueRef.current, caretRef.current);
      },
      [emitQuery]
    );

    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        clear: () => {
          mentionsRef.current = [];
          prevValueRef.current = '';
          caretRef.current = 0;
          setSelection(undefined);
          onChangeText('');
          onMentionQueryChange?.(null);
        },
        insertMention: (mention) => {
          const active = detectMentionQuery(
            prevValueRef.current,
            caretRef.current
          );
          const start = active ? active.start : caretRef.current;
          const { text, segment, caret } = insertMentionToken(
            prevValueRef.current,
            start,
            caretRef.current,
            {
              userId: mention.userId,
              display: mention.display,
              type: mention.type ?? 'user',
            }
          );
          mentionsRef.current = [...mentionsRef.current, segment];
          prevValueRef.current = text;
          caretRef.current = caret;
          setSelection({ start: caret, end: caret });
          onChangeText(text);
          onMentionQueryChange?.(null);
        },
        getText: () => prevValueRef.current,
        getMentioned: () => mentionsRef.current,
        getMentionees: () => toMentionees(mentionsRef.current),
      }),
      [onChangeText, onMentionQueryChange]
    );

    return (
      <View style={[styles.wrapper, { maxHeight }, style]}>
        {mentionOverlay}
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onSelectionChange={handleSelectionChange}
          selection={selection}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor ?? placeholderColor}
          editable={editable}
          autoFocus={autoFocus}
          multiline
          onSubmitEditing={onSend}
          blurOnSubmit={false}
        />
      </View>
    );
  }
);
