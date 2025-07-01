import {
  TextInputProps,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import React, { FC, Ref, memo, useCallback, useEffect, useState } from 'react';
import { useStyles } from './styles';
import SearchItem from '../SearchItem';
import {
  MentionSuggestionsProps,
  MentionInput as MentionTextInput,
  replaceMentionValues,
} from 'react-native-controlled-mentions';
import useSearch, { TSearchItem } from '../../hook/useSearch';
import { IMentionPosition } from '../../types/type';

interface IMentionInput extends TextInputProps {
  setInputMessage: (inputMessage: string) => void;
  mentionsPosition: IMentionPosition[];
  setMentionsPosition: (mentionsPosition: IMentionPosition[]) => void;
  mentionUsers: TSearchItem[];
  setMentionUsers: (mentionUsers: TSearchItem[]) => void;
  isBottomMentionSuggestionsRender: boolean;
  privateCommunityId?: string;
  initialValue?: string;
  resetValue?: boolean;
  inputRef?: Ref<TextInput>;
  setIsShowingSuggestion?: (arg: boolean) => void;
}

const AmityMentionInput: FC<IMentionInput> = ({
  initialValue = '',
  setInputMessage,
  mentionsPosition,
  setMentionsPosition,
  mentionUsers,
  setMentionUsers,
  isBottomMentionSuggestionsRender,
  privateCommunityId,
  resetValue,
  inputRef,
  setIsShowingSuggestion,
  ...rest
}) => {
  const { styles } = useStyles();
  const [cursorIndex, setCursorIndex] = useState(0);
  const [value, setValue] = useState<string>(initialValue);
  const [currentSearchUserName, setCurrentSearchUserName] = useState('');
  const { searchResult, getNextPage } = useSearch(
    currentSearchUserName,
    privateCommunityId
  );

  const onSelectUserMention = (user: TSearchItem) => {
    const position: IMentionPosition = {
      type: 'user',
      userId: user.id,
      displayName: user.displayName,
      length: user.displayName.length + 1,
      index: cursorIndex - 1 - currentSearchUserName.length,
    };
    const newMentionUsers = [...mentionUsers, user];
    const newMentionPosition = [...mentionsPosition, position];
    setMentionUsers(newMentionUsers);
    setMentionsPosition(newMentionPosition);
    setCurrentSearchUserName(null);
  };

  const onChangeInput = useCallback(
    (text: string) => {
      setValue(text);
      setInputMessage(replaceMentionValues(text, ({ name }) => `@${name}`));
    },
    [setInputMessage]
  );

  useEffect(() => {
    onChangeInput(resetValue ? '' : initialValue);
  }, [initialValue, onChangeInput, resetValue]);

  const renderSuggestions: FC<MentionSuggestionsProps> = ({
    keyword,
    onSuggestionPress,
  }) => {
    setCurrentSearchUserName(keyword || '');
    setIsShowingSuggestion && setIsShowingSuggestion(keyword?.length > 0);

    if (keyword == null || !searchResult || searchResult?.length === 0) {
      return null;
    }

    return (
      <KeyboardAvoidingView style={styles.mentionListContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => getNextPage && getNextPage()}
          nestedScrollEnabled={true}
          data={searchResult}
          renderItem={({ item }: { item: TSearchItem }) => {
            return (
              <SearchItem
                target={item}
                onPress={() => {
                  onSelectUserMention(item);
                  onSuggestionPress(item);
                }}
                userProfileNavigateEnabled={false}
              />
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </KeyboardAvoidingView>
    );
  };

  return (
    <MentionTextInput
      {...rest}
      value={value}
      inputRef={inputRef}
      style={styles.inputText}
      onChange={onChangeInput}
      onSelectionChange={(event) =>
        setCursorIndex(event.nativeEvent.selection.start)
      }
      partTypes={[
        {
          isBottomMentionSuggestionsRender,
          trigger: '@',
          renderSuggestions,
          textStyle: styles.mentionText,
        },
      ]}
    />
  );
};

export default memo(AmityMentionInput);
