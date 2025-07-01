import React from 'react';
import { View } from 'react-native';
import AmityMentionInput from '../../../component/MentionInput/AmityMentionInput';
import { Typography } from '../../../component/Typography/Typography';
import { MAX_POLL_QUESTION_LENGTH } from '../../../constants';
import {
  PollPostComposerContextType,
  usePollPostComposerContext,
} from './AmityPollPostComposerPage';
import { useStyles } from './styles';

type PollQuestionProps = Pick<
  PollPostComposerContextType,
  | 'mentionUsers'
  | 'setMentionUsers'
  | 'mentionPosition'
  | 'setMentionPosition'
  | 'setIsScrollEnabled'
> & {
  privateCommunityId?: string;
};
export function PollQuestion({
  privateCommunityId,
  mentionUsers,
  setMentionUsers,
  mentionPosition,
  setMentionPosition,
  setIsScrollEnabled,
}: PollQuestionProps) {
  const { styles, theme } = useStyles();
  const { pollQuestion, setPollQuestion } = usePollPostComposerContext();
  return (
    <View style={styles.fieldContainer}>
      <View
        style={[
          styles.inputContainer,
          pollQuestion.length > MAX_POLL_QUESTION_LENGTH &&
            styles.inputContainerError,
        ]}
      >
        <View style={styles.rowContainer}>
          <Typography.TitleBold style={styles.base}>
            Poll question
          </Typography.TitleBold>
          <Typography.Caption style={styles.baseShade1}>
            {pollQuestion.length}/{MAX_POLL_QUESTION_LENGTH}
          </Typography.Caption>
        </View>
        <AmityMentionInput
          multiline
          privateCommunityId={privateCommunityId}
          isBottomMentionSuggestionsRender={true}
          onFocus={() => setIsScrollEnabled(false)}
          onBlur={() => setIsScrollEnabled(true)}
          placeholder="What's your poll question?"
          placeholderTextColor={theme.colors.baseShade3}
          setInputMessage={setPollQuestion}
          mentionUsers={mentionUsers}
          setMentionUsers={setMentionUsers}
          mentionsPosition={mentionPosition}
          setMentionsPosition={setMentionPosition}
        />
      </View>
      {pollQuestion.length > MAX_POLL_QUESTION_LENGTH && (
        <Typography.Caption style={styles.errorText}>
          Poll question cannot exceed {MAX_POLL_QUESTION_LENGTH} characters.
        </Typography.Caption>
      )}
    </View>
  );
}
