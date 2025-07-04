import React from 'react';
import { View } from 'react-native';
import { useStyles } from './style';
import { PollFooter } from './PollFooter';
import { PollOptions } from './PollOption';
import { usePoll } from '../../hook/usePoll';
import { Typography } from '../Typography/Typography';

type PollContentProps = {
  pollId: string;
  post: Amity.Post<any>;
  disabledPoll?: boolean;
  showedAllOptions?: boolean;
};

const PollContent = ({
  post,
  pollId,
  disabledPoll,
  showedAllOptions,
}: PollContentProps) => {
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
        disabledPoll={disabledPoll}
        isPollClosed={isPollClosed}
        answerType={poll.answerType}
        isAlreadyVoted={isAlreadyVoted}
        showedAllOptions={showedAllOptions}
        isAuthorSeeingResults={isAuthorSeeingResults}
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
