import React, { useState, useEffect } from 'react';
import SearchItem from '../../component/SearchItem';
import { TSearchItem } from '..';
import { TriggersConfig, useMentions } from 'react-native-controlled-mentions';
import { useStyles } from './styles';
import {
  FlatList,
  Keyboard,
  StyleProp,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import useSearch from '../useSearch';
import { IMentionPosition } from '../../../types';

type UseMentionProps = {
  value: string;
  communityId?: string;
  onChange: (value: string) => void;
  setMentionPosition: (position: IMentionPosition) => void;
  setMentionUsers: (user: TSearchItem) => void;
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
}: UseMentionProps) {
  const { styles } = useStyles();
  const [cursorIndex, setCursorIndex] = useState(0);

  const triggersConfig: TriggersConfig<'mention'> = {
    mention: {
      trigger: '@',
      textStyle: styles.mention,
      isInsertSpaceAfterMention: true,
    },
  };

  const { textInputProps, triggers } = useMentions({
    value,
    onChange,
    triggersConfig,
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
}: SuggestionsProps) => {
  const { styles } = useStyles();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const keyword = triggers?.mention?.keyword || '';

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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardWillShow',
      (event) => setKeyboardHeight(event.endCoordinates.height)
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (!keyword) return null;

  return (
    <FlatList
      data={searchResult}
      nestedScrollEnabled={true}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onEndReached={() => getNextPage?.()}
      contentContainerStyle={styles.mentionSuggestionContentContainer}
      style={[
        type === 'post' && styles.postMentionSuggestionContainer,
        type === 'comment' && styles.commentMentionContainer,
        { height: 54 * searchResult.length, bottom: bottom + keyboardHeight },
        style && style,
      ]}
      renderItem={({ item }: { item: TSearchItem }) => {
        return (
          <SearchItem
            target={item}
            userProfileNavigateEnabled={false}
            onPress={() => {
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
