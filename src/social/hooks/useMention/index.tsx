import { useState } from 'react';
import SearchItem from '../../components/SearchItem';
import { TSearchItem } from '..';
import {
  PatternsConfig,
  TriggersConfig,
  useMentions,
} from 'react-native-controlled-mentions';
import { useStyles } from './styles';
import {
  FlatList,
  StyleProp,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import useSearch from '../useSearch';
import { IMentionPosition } from '../../../core/types';
type UseMentionProps = {
  value: string;
  communityId?: string;
  onChange: (value: string) => void;
  setMentionPosition: (position: IMentionPosition) => void;
  setMentionUsers: (user: TSearchItem) => void;
  isMentionLimitReached?: boolean;
  onMentionLimitReached?: () => void;
};

type RenderSuggestionsProps = {
  type?: 'post' | 'comment';
  style?: StyleProp<ViewStyle>;
  bottom?: number;
};

function useMention({
  value,
  onChange,
  communityId,
  setMentionUsers,
  setMentionPosition,
  isMentionLimitReached,
  onMentionLimitReached,
}: UseMentionProps) {
  const { styles, theme } = useStyles();
  const [cursorIndex, setCursorIndex] = useState(0);

  const triggersConfig: TriggersConfig<'mention'> = {
    mention: {
      trigger: '@',
      textStyle: styles.mention,
      isInsertSpaceAfterMention: true,
    },
  };

  // Highlight URLs while typing in the TextInput.
  //
  // Rules for react-native-controlled-mentions patternsConfig:
  //  1. The regex MUST have exactly ONE capturing group — the library uses
  //     String.split(regex) and expects the matched text at odd indices.
  //  2. textStyle must be a plain object (not a StyleSheet ID) so the library
  //     can pass it directly as a style prop to its internal Text component.
  const patternsConfig: PatternsConfig = {
    url: {
      pattern:
        /(?<![a-zA-Z0-9_])((?:https?|ftp):\/\/(?:[a-zA-Z0-9.\-]+|[\d.]+)(?::\d{1,5})?(?:\/(?:[^\s<>|()]*(?:\([^\s<>|()]*\)[^\s<>|()]*)*)*)?(?<![.])(?![^\s]*\()|mailto:[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}|www\.[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?:\/(?:[^\s<>|()]*(?:\([^\s<>|()]*\)[^\s<>|()]*)*)*)?(?<![.])(?![^\s]*\())/gi,
      textStyle: {
        color: theme.colors.primary,
      },
    },
  };

  const { textInputProps, triggers } = useMentions({
    value,
    onChange,
    triggersConfig,
    patternsConfig,
    onSelectionChange: (selection) => setCursorIndex(selection.start),
  });

  const renderInput = (props: TextInputProps) => {
    return <TextInput {...textInputProps} {...props} />;
  };

  const renderSuggestions = ({
    type,
    style,
    bottom,
  }: RenderSuggestionsProps) => {
    return (
      <Suggestions
        bottom={bottom}
        style={style}
        type={type}
        triggers={triggers}
        cursorIndex={cursorIndex}
        communityId={communityId}
        setMentionUsers={setMentionUsers}
        setMentionPosition={setMentionPosition}
        isMentionLimitReached={isMentionLimitReached}
        onMentionLimitReached={onMentionLimitReached}
      />
    );
  };

  return {
    renderInput,
    renderSuggestions,
  };
}

type SuggestionsProps = {
  type?: 'post' | 'comment';
  style?: StyleProp<ViewStyle>;
  triggers: any;
  bottom?: number;
  cursorIndex: number;
  communityId?: string;
  setMentionUsers: (user: TSearchItem) => void;
  setMentionPosition: (position: IMentionPosition) => void;
  isMentionLimitReached?: boolean;
  onMentionLimitReached?: () => void;
};

const Suggestions = ({
  type,
  style,
  bottom = 0,
  triggers,
  cursorIndex,
  communityId,
  setMentionUsers,
  setMentionPosition,
  isMentionLimitReached,
  onMentionLimitReached,
}: SuggestionsProps) => {
  const { styles } = useStyles();

  const keyword = triggers?.mention?.keyword;

  const { searchResult, getNextPage } = useSearch(keyword, communityId);

  const onSelectUserMention = (user: TSearchItem) => {
    const position = {
      type: 'user',
      userId: user.id,
      displayName: user.displayName,
      length: user.displayName.length + 1,
      index: cursorIndex - 1 - keyword?.length,
    };
    setMentionUsers(user);
    setMentionPosition(position);
  };

  if (keyword == null) return null;

  return (
    <FlatList
      data={searchResult}
      nestedScrollEnabled={true}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onEndReached={() => getNextPage?.()}
      contentContainerStyle={
        type === 'comment' && styles.mentionSuggestionContentContainer
      }
      style={[
        type === 'post' && styles.postMentionSuggestionContainer,
        type === 'comment' && styles.commentMentionContainer,
        { height: 56 * searchResult.length },
        type === 'comment' && { bottom: bottom },
        style && style,
      ]}
      renderItem={({ item }: { item: TSearchItem }) => {
        return (
          <SearchItem
            target={item}
            userProfileNavigateEnabled={false}
            onPress={() => {
              if (isMentionLimitReached) {
                onMentionLimitReached?.();
                return;
              }
              triggers?.mention?.onSelect(item);
              onSelectUserMention(item);
            }}
          />
        );
      }}
    />
  );
};

export default useMention;
