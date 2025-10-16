import React from 'react';
import { useStyles } from './style';
import { View } from 'react-native';
import { useUser } from '../../hook';
import { ElementID } from '../../enum';
import useAuth from '../../../hooks/useAuth';
import { Typography } from '../Typography/Typography';
import AvatarElement from '../../PublicApi/Elements/CommonElements/AvatarElement';
import { formatVoteCount } from '../../../util/timeUtil';

type PollResultsProps = {
  totalVotes: number;
  options: Amity.PollAnswer[];
};

export function PollResults({ options, totalVotes }: PollResultsProps) {
  const { styles } = useStyles();
  const { client } = useAuth();
  const user = useUser((client as Amity.Client).userId);

  const maxVoteCount = Math.max(...options.map((option) => option.voteCount));

  const percentage = (voteCount: number) =>
    +Math.min(
      totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100,
      100
    ).toFixed(2);

  const voteBy = (option: Amity.PollAnswer) => {
    if (option.voteCount === 1 && option.isVotedByUser) return 'Voted by you';
    if (option.voteCount > 1) {
      const voteCount = option.isVotedByUser
        ? option.voteCount - 1
        : option.voteCount;
      const formattedCount = formatVoteCount(voteCount);
      return `Voted by ${formattedCount} participant${
        voteCount > 1 ? 's' : ''
      }${option.isVotedByUser ? ' and you' : ''}`;
    }
    return 'No votes';
  };

  return (
    <View style={styles.pollResults}>
      {options.map((option) => {
        const isHighestVote =
          option.voteCount === maxVoteCount && maxVoteCount > 0;
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
                  avatarId={user?.avatarFileId}
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
