import React from 'react';
import { useStyles } from './styles';
import { View } from 'react-native';
import { MAX_POLL_QUESTION_LENGTH } from '../../../constants';
import { Typography } from '../../../component/Typography/Typography';
import { usePollPostComposerContext } from './AmityPollPostComposerPage';
import { replaceTriggerValues } from 'react-native-controlled-mentions';
import FormLabel from '../../../elements/FormLabel';
import { ElementID, PageID } from '../../../enum';

type PollQuestionProps = {
  renderInput?: (props: any) => React.ReactNode;
};

export function PollQuestion({ renderInput }: PollQuestionProps) {
  const { styles, theme } = useStyles();
  const { pollQuestion } = usePollPostComposerContext();

  const questionLength = replaceTriggerValues(
    pollQuestion,
    ({ name }) => `@${name}`
  ).length;

  return (
    <View style={styles.fieldContainer}>
      <View
        style={[
          styles.inputContainer,
          questionLength > MAX_POLL_QUESTION_LENGTH &&
            styles.inputContainerError,
        ]}
      >
        <View style={styles.rowContainer}>
          <FormLabel
            style={styles.base}
            pageId={PageID.poll_post_composer_page}
            elementId={ElementID.poll_question_title}
          />
          <Typography.Caption>
            {questionLength}/{MAX_POLL_QUESTION_LENGTH}
          </Typography.Caption>
        </View>
        {renderInput({
          multiline: true,
          style: styles.pollQuestionInput,
          placeholder: "What's your poll question?",
          placeholderTextColor: theme.colors.baseShade3,
        })}
      </View>
      {questionLength > MAX_POLL_QUESTION_LENGTH && (
        <Typography.Caption style={styles.errorText}>
          Poll question cannot exceed {MAX_POLL_QUESTION_LENGTH} characters.
        </Typography.Caption>
      )}
    </View>
  );
}
