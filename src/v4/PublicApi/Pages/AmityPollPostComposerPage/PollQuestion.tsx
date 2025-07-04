import React from 'react';
import { useStyles } from './styles';
import { View } from 'react-native';
import { MAX_POLL_QUESTION_LENGTH } from '../../../constants';
import { Typography } from '../../../component/Typography/Typography';
import { usePollPostComposerContext } from './AmityPollPostComposerPage';

type PollQuestionProps = {
  renderInput?: (props: any) => React.ReactNode;
};

export function PollQuestion({ renderInput }: PollQuestionProps) {
  const { styles, theme } = useStyles();
  const { pollQuestion } = usePollPostComposerContext();

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
        {renderInput({
          multiline: true,
          style: styles.pollQuestionInput,
          placeholder: "What's your poll question?",
          placeholderTextColor: theme.colors.baseShade3,
        })}
      </View>
      {pollQuestion.length > MAX_POLL_QUESTION_LENGTH && (
        <Typography.Caption style={styles.errorText}>
          Poll question cannot exceed {MAX_POLL_QUESTION_LENGTH} characters.
        </Typography.Caption>
      )}
    </View>
  );
}
