import React from 'react';
import { View, TextInput } from 'react-native';
import { SvgXml } from 'react-native-svg';
import trash from '../../../assets/icons/trash';
import { Typography } from '../../../component/Typography/Typography';
import { MAX_POLL_ANSWER_LENGTH } from '../../../constants';
import { usePollPostComposerContext } from './AmityPollPostComposerPage';
import { useStyles } from './styles';
import FormLabel from '../../../elements/FormLabel';
import { ElementID, PageID } from '../../../enum';
import FormDescription from '../../../elements/FormDescription';
import AddOptionButton from '../../../elements/AddOptionButton';

type PollOptionsProps = {
  onPressAddOption: () => void;
  onPressRemoveOption: (index: number) => void;
  onChangeOptionText: (text: string, index: number) => void;
};
export function PollOptions({
  onPressAddOption,
  onPressRemoveOption,
  onChangeOptionText,
}: PollOptionsProps) {
  const { styles, theme } = useStyles();
  const { pollOptions } = usePollPostComposerContext();

  return (
    <View style={styles.fieldContainer}>
      <FormLabel
        style={styles.base}
        pageId={PageID.poll_post_composer_page}
        elementId={ElementID.poll_options_title}
      />
      <FormDescription
        style={styles.baseShade1}
        pageId={PageID.poll_post_composer_page}
        elementId={ElementID.poll_options_desc}
      />
      <View style={styles.optionsContainer}>
        {pollOptions.map((pollOption, index) => {
          const onReachMaxChar =
            pollOption.data.length > MAX_POLL_ANSWER_LENGTH;

          return (
            <View key={`Option ${index + 1}`}>
              <View style={styles.pollOptionContainer}>
                <View
                  style={[
                    styles.pollOptionInputContainer,
                    onReachMaxChar && styles.pollOptionInputContainerError,
                  ]}
                >
                  <TextInput
                    multiline
                    style={styles.pollOptionInput}
                    value={pollOptions[index].data}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={theme.colors.baseShade3}
                    onChangeText={(text) => onChangeOptionText(text, index)}
                  />
                </View>
                <View>
                  <SvgXml
                    width="20"
                    height="20"
                    xml={trash()}
                    color={theme.colors.base}
                    onPress={() => onPressRemoveOption(index)}
                  />
                </View>
              </View>
              {onReachMaxChar && (
                <Typography.Caption style={styles.errorText}>
                  Poll option cannot exceed {MAX_POLL_ANSWER_LENGTH} characters.
                </Typography.Caption>
              )}
            </View>
          );
        })}
        {pollOptions.length < 10 && (
          <AddOptionButton
            onPress={onPressAddOption}
            pageId={PageID.poll_post_composer_page}
          />
        )}
      </View>
    </View>
  );
}
