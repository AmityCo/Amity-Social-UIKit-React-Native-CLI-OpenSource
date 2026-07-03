import { Radio } from '../../../core/components/Radio';
import { useStyles } from './style';
import { CheckBox } from '../../../core/components/CheckBox';
import { PollResults } from './PollResults';
import { Typography } from '../../../core/components/Typography/Typography';
import { TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import Button, { BUTTON_SIZE } from '../Button/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { useInteractionBehavior } from '../../hooks/useInteractionBehavior';

type PollOptionsProps = {
  post?: Amity.Post<any>;
  totalVotes: number;
  isPollClosed: boolean;
  isAlreadyVoted: boolean;
  showedAllOptions?: boolean;
  options: Amity.PollAnswer[];
  disabledPoll?: boolean;
  isAuthorSeeingResults?: boolean;
  answerType: Amity.PollAnswerType;
  votePoll: (selectedOption: string[]) => void;
};

export function PollOptions({
  post,
  options,
  votePoll,
  totalVotes,
  answerType,
  isPollClosed,
  isAlreadyVoted,
  showedAllOptions,
  disabledPoll,
  isAuthorSeeingResults,
}: PollOptionsProps) {
  const DEFAULT_DISPLAY_OPTIONS = 4;
  const isSingleOption = answerType === 'single';
  const hiddenOptions = options.length - DEFAULT_DISPLAY_OPTIONS;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { styles } = useStyles();
  const { handleInteraction } = useInteractionBehavior();
  const [selectedOption, setSelectedOption] = useState<Amity.PollAnswer[]>([]);

  const btnDisabled = selectedOption.length === 0;

  return (
    <View>
      {isPollClosed || isAlreadyVoted || isAuthorSeeingResults ? (
        <PollResults
          options={[...options]
            .sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, showedAllOptions ? options.length : 4)}
          totalVotes={totalVotes}
        />
      ) : isSingleOption ? (
        <Radio.Group<Amity.PollAnswer>
          value={selectedOption[0]}
          style={styles.optionGroup}
          onChange={(value) => setSelectedOption([value])}
          select={(value, option) => value.id === option.id}
        >
          {options
            .slice(
              0,
              showedAllOptions ? options.length : DEFAULT_DISPLAY_OPTIONS
            )
            .map((option) => (
              <Radio.Option<Amity.PollAnswer>
                value={option}
                key={option.id}
                style={({ selected }) => [
                  styles.option,
                  selected && styles.optionSelected,
                ]}
              >
                <Radio.Label style={styles.optionLabel}>
                  <Typography.BodyBold>{option.data}</Typography.BodyBold>
                </Radio.Label>
                <Radio.Icon />
              </Radio.Option>
            ))}
        </Radio.Group>
      ) : (
        <CheckBox.Group<Amity.PollAnswer>
          value={selectedOption}
          style={styles.optionGroup}
          onChange={(value) => setSelectedOption(value)}
          select={(value, option) =>
            !!value.find((item) => item.id === option.id)
          }
          extractKey={(value) => value.id}
        >
          {options
            .slice(
              0,
              showedAllOptions ? options.length : DEFAULT_DISPLAY_OPTIONS
            )
            .map((option) => (
              <CheckBox.Option<Amity.PollAnswer>
                value={option}
                key={option.id}
                style={({ selected }) => [
                  styles.option,
                  selected && styles.optionSelected,
                ]}
              >
                <CheckBox.Label style={styles.optionLabel}>
                  <Typography.BodyBold>{option.data}</Typography.BodyBold>
                </CheckBox.Label>
                <CheckBox.Icon />
              </CheckBox.Option>
            ))}
        </CheckBox.Group>
      )}
      {!showedAllOptions && hiddenOptions > 0 && (
        <Button
          type="secondary"
          size={BUTTON_SIZE.LARGE}
          style={styles.seeMoreOptionsBtn}
          onPress={() =>
            navigation.navigate('PostDetail', { postId: post.postId })
          }
        >
          <Typography.BodyBold>
            {isPollClosed || isAlreadyVoted
              ? `See full results`
              : `See ${hiddenOptions} more options`}
          </Typography.BodyBold>
        </Button>
      )}
      {!isPollClosed && !isAlreadyVoted && (
        <TouchableOpacity
          disabled={btnDisabled}
          style={[styles.voteBtn, btnDisabled && styles.voteBtnDisabled]}
          onPress={() =>
            handleInteraction({
              defaultBehavior: () =>
                votePoll(selectedOption.map((option) => option.id)),
              isJoined: !disabledPoll,
            })
          }
        >
          <Typography.BodyBold style={styles.voteBtnLabel}>
            Vote
          </Typography.BodyBold>
        </TouchableOpacity>
      )}
    </View>
  );
}
