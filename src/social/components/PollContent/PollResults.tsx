import React from 'react';
import { useStyles } from './style';
import { View } from 'react-native';
import { useUser } from '../../hooks';
import { ElementID } from '../../enums';
import useAuth from '../../../core/hooks/useAuth';
import { Typography } from '../Typography/Typography';
import AvatarElement from '../../../v4/PublicApi/Elements/CommonElements/AvatarElement';
import { formatVoteCount } from '../../../core/utils/time';

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

  const voteBy = (option: Amity.PollAnswer): string => {
    const { voteCount, isVotedByUser } = option;

    if (voteCount === 0) return 'No votes';

    if (isVotedByUser) {
      const otherVotes = voteCount - 1;
      if (otherVotes === 0) return 'Voted by you';

      const formattedCount = formatVoteCount(otherVotes);
      const plural = otherVotes > 1 ? 's' : '';
      return `Voted by ${formattedCount} participant${plural} and you`;
    }

    const formattedCount = formatVoteCount(voteCount);
    const plural = voteCount > 1 ? 's' : '';
    return `Voted by ${formattedCount} participant${plural}`;
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
                  avatarCustomUrl={user?.avatarCustomUrl}
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
