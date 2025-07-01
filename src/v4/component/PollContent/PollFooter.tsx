import React from 'react';
import { useStyles } from './style';
import { TouchableOpacity, View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { Client } from '@amityco/ts-sdk-react-native';
import { formatTimeLeft } from '../../../util/timeUtil';

type PollFooterProps = {
  totalVotes: number;
  poll: Amity.RawPoll;
  isPollClosed: boolean;
  post?: Amity.Post<any>;
  isAlreadyVoted?: boolean;
  isAuthorSeeingResults: boolean;
  setIsAuthorSeeingResults: (value: boolean) => void;
};

export function PollFooter({
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
      {!isPollClosed &&
        !isAlreadyVoted &&
        !isAuthorSeeingResults &&
        !isInReview &&
        isAuthor && (
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
