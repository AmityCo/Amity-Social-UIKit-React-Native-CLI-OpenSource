import { Radio } from '../Radio';
import { useStyles } from './style';
import { usePoll } from '../../hook/usePoll';
import { TouchableOpacity, View } from 'react-native';
import { Typography } from '../Typography/Typography';
import React, { useState } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';
import Button, { BUTTON_SIZE } from '../Button/Button';
import { formatTimeLeft } from '../../../util/timeUtil';
import { CheckBox } from '../CheckBox';
import AvatarElement from '../../PublicApi/Elements/CommonElements/AvatarElement';
import { ElementID } from '../../enum';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/v4/routes/RouteParamList';

type PollContentProps = {
  pollId: string;
  post: Amity.Post<any>;
  showedAllOptions?: boolean;
};

const PollContent = ({ pollId, post, showedAllOptions }: PollContentProps) => {
  const { styles } = useStyles();
  const {
    poll,
    votePoll,
    totalVotes,
    isPollClosed,
    isAlreadyVoted,
    isAuthorSeeingResults,
    setIsAuthorSeeingResults,
  } = usePoll(pollId);

  if (!poll) return null;

  return (
    <View style={styles.container}>
      {!isPollClosed && !isAlreadyVoted && (
        <View style={styles.header}>
          <Typography.CaptionBold style={styles.baseShade2}>
            Select one option
          </Typography.CaptionBold>
        </View>
      )}
      <PollOptions
        post={post}
        votePoll={votePoll}
        options={poll.answers}
        totalVotes={totalVotes}
        isPollClosed={isPollClosed}
        answerType={poll.answerType}
        isAlreadyVoted={isAlreadyVoted}
        showedAllOptions={showedAllOptions}
      />
      <PollFooter
        poll={poll}
        post={post}
        totalVotes={totalVotes}
        isPollClosed={isPollClosed}
        isAlreadyVoted={isAlreadyVoted}
        isAuthorSeeingResults={isAuthorSeeingResults}
        setIsAuthorSeeingResults={setIsAuthorSeeingResults}
      />
    </View>
  );
};

export default PollContent;

type PollOptionsProps = {
  post?: Amity.Post<any>;
  totalVotes: number;
  isPollClosed: boolean;
  isAlreadyVoted: boolean;
  showedAllOptions?: boolean;
  options: Amity.PollAnswer[];
  answerType: Amity.PollAnswerType;
  votePoll: (selectedOption: string[]) => void;
};

function PollOptions({
  post,
  options,
  votePoll,
  totalVotes,
  answerType,
  isPollClosed,
  isAlreadyVoted,
  showedAllOptions,
}: PollOptionsProps) {
  const DEFAULT_DISPLAY_OPTIONS = 4;
  const isSingleOption = answerType === 'single';
  const hiddenOptions = options.length - DEFAULT_DISPLAY_OPTIONS;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { styles, theme } = useStyles();
  const [selectedOption, setSelectedOption] = useState<Amity.PollAnswer[]>([]);

  return (
    <View>
      {isPollClosed || isAlreadyVoted ? (
        <PollResults
          options={options
            .sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, showedAllOptions ? options.length : 4)}
          totalVotes={totalVotes}
          post={post}
        />
      ) : isSingleOption ? (
        <Radio.Group<Amity.PollAnswer>
          value={selectedOption[0]}
          style={styles.optionGroup}
          onChange={(value) => {
            console.log('onChange', value);
            setSelectedOption([value]);
          }}
          select={(value, option) => value.id === option.id}
        >
          {options
            .slice(0, selectedOption ? options.length : DEFAULT_DISPLAY_OPTIONS)
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
            .slice(0, selectedOption ? options.length : DEFAULT_DISPLAY_OPTIONS)
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
          themeStyle={theme}
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
        <Button
          type="primary"
          themeStyle={theme}
          style={styles.voteBtn}
          size={BUTTON_SIZE.LARGE}
          disabled={selectedOption.length === 0}
          onPress={() => votePoll(selectedOption.map((option) => option.id))}
        >
          <Typography.BodyBold style={styles.voteBtnLabel}>
            Vote
          </Typography.BodyBold>
        </Button>
      )}
    </View>
  );
}

type PollFooterProps = {
  totalVotes: number;
  poll: Amity.RawPoll;
  isPollClosed: boolean;
  post?: Amity.Post<any>;
  isAlreadyVoted?: boolean;
  isAuthorSeeingResults: boolean;
  setIsAuthorSeeingResults: (value: boolean) => void;
};

function PollFooter({
  post,
  poll,
  totalVotes,
  isPollClosed,
  isAlreadyVoted,
  isAuthorSeeingResults,
  setIsAuthorSeeingResults,
}: PollFooterProps) {
  const { styles } = useStyles();
  const { userId } = Client.getActiveUser();

  const isAuthor = post?.creator?.userId === userId;
  const isInReview = post?.feedType === 'reviewing';

  return (
    <View style={styles.footer}>
      <View style={styles.pollInfo}>
        <Typography.CaptionBold style={styles.baseShade2}>
          {totalVotes.toLocaleString()} vote
          {`${totalVotes && totalVotes > 1 ? 's' : ''}`}
        </Typography.CaptionBold>
        <Typography.CaptionBold style={styles.baseShade2}>
          •
        </Typography.CaptionBold>
        <Typography.CaptionBold style={styles.baseShade2}>
          {isPollClosed ? 'Ended' : `${formatTimeLeft(poll.closedIn)} left`}
        </Typography.CaptionBold>
      </View>
      {!isAlreadyVoted && !isAuthorSeeingResults && !isInReview && isAuthor && (
        <TouchableOpacity onPress={() => setIsAuthorSeeingResults(true)}>
          <Typography.CaptionBold style={styles.seeResultsBtnLabel}>
            See results
          </Typography.CaptionBold>
        </TouchableOpacity>
      )}
      {isAuthorSeeingResults && (
        <TouchableOpacity onPress={() => setIsAuthorSeeingResults(false)}>
          <Typography.CaptionBold style={styles.seeResultsBtnLabel}>
            Back to vote
          </Typography.CaptionBold>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PollResults({
  post,
  options,
  totalVotes,
}: {
  post?: Amity.Post<any>;
  totalVotes: number;
  options: Amity.PollAnswer[];
}) {
  const { styles } = useStyles();

  const maxVoteCount = Math.max(...options.map((option) => option.voteCount));

  const percentage = (voteCount: number) => (voteCount / totalVotes) * 100;

  const voteBy = (option: Amity.PollAnswer) => {
    if (totalVotes === 1 && option.isVotedByUser) return 'Voted by you';
    if (totalVotes > 1)
      return `Voted by ${totalVotes} participant${totalVotes > 1 ? 's' : ''}${
        option.isVotedByUser ? ' and you' : ''
      }`;
    return 'No votes';
  };

  return (
    <View style={styles.pollResults}>
      {options.map((option) => {
        const isHighestVote = option.voteCount === maxVoteCount;
        return (
          <View
            key={option.id}
            style={[
              styles.optionResult,
              isHighestVote && styles.topOptionResult,
            ]}
          >
            <View style={styles.optionResultHeader}>
              <Typography.BodyBold style={styles.optionResultLabel}>
                {option.data}
              </Typography.BodyBold>
              <Typography.BodyBold
                style={[
                  styles.optionResultPercentage,
                  isHighestVote && styles.topOptionResultPercentage,
                ]}
              >
                {percentage(option.voteCount)}%
              </Typography.BodyBold>
            </View>
            <View style={styles.optionResultVoters}>
              <Typography.Caption style={styles.baseShade2}>
                {voteBy(option)}
              </Typography.Caption>
              {option.isVotedByUser && (
                <AvatarElement
                  targetType="user"
                  style={styles.optionAvatar}
                  avatarId={post.creator?.avatarFileId}
                  elementID={ElementID.WildCardElement}
                />
              )}
            </View>
            <View
              style={[
                styles.optionResultProgressBar,
                isHighestVote && styles.topOptionResultProgressBar,
              ]}
            >
              <View
                style={[
                  styles.optionResultProgressBarLength,
                  isHighestVote && styles.topOptionResultProgressBarLength,
                  { width: `${percentage(option.voteCount)}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
