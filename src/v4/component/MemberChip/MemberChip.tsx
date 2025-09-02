import React from 'react';
import Avatar from '../Avatar';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useStyles } from './styles';
import { CloseButton } from '~/v4/elements';
import { Typography } from '../Typography/Typography';

type MemberChipProps = {
  style?: StyleProp<ViewStyle>;
  member: Amity.User;
  onPress?: (member: Amity.User) => void;
};

export function MemberChip({ style, member, onPress }: MemberChipProps) {
  const { styles, theme } = useStyles();

  return (
    <View style={[styles.memberChip, style]}>
      <View style={styles.memberAvatarContainer}>
        <Avatar.User
          uri={member.avatar?.fileUrl}
          imageStyle={styles.memberAvatar}
          userName={member.displayName || member.userId}
        />
        {onPress && (
          <TouchableOpacity style={styles.removeButtonContainer}>
            <CloseButton
              onPress={() => onPress(member)}
              iconProps={{
                color: theme.colors.background,
                width: 12,
                height: 12,
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      <Typography.Caption
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.memberName}
      >
        {member.displayName || member.userId}
      </Typography.Caption>
    </View>
  );
}
