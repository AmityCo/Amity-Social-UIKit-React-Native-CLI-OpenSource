import React from 'react';
import { Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '~/providers/amity-ui-kit-provider';
import { Typography } from '~/v4/component/Typography/Typography';
import { cancelFollowRequest } from '~/v4/../svg/svg-xml-list';
import {
  following as followingIcon,
  unfollow as unfollowIcon,
  unblock as unblockIcon,
} from '~/v4/assets/icons';

import { useStyles } from './styles';
import { useBottomSheet } from '~/redux/slices/bottomSheetSlice';
import MenuAction from '~/v4/elements/MenuAction';

interface FollowButtonProps {
  userId: string;
  followStatus: string | null;
  userName?: string;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  unblockUser: (userName?: string) => void;
  socialSettings?: 'public' | 'private';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  followStatus,
  userName,
  followUser,
  unfollowUser,
  unblockUser,
  socialSettings,
}) => {
  const theme = useTheme() as MyMD3Theme;
  const styles = useStyles();

  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  const isMyProfile = !followStatus;
  const isBlocked = followStatus === 'blocked';
  const isUnfollowed = followStatus === 'none';
  const isPending = followStatus === 'pending';
  const isAccepted = followStatus === 'accepted';

  const renderFollowButton = () => {
    return (
      <TouchableOpacity
        style={styles.followButton}
        onPress={() => followUser(userId)}
      >
        <Image
          source={require('~/v4/assets/images/followPlus.png')}
          style={styles.followIcon}
        />
        <Typography.BodyBold style={styles.followText}>
          Follow
        </Typography.BodyBold>
      </TouchableOpacity>
    );
  };

  const renderFollowingButton = () => {
    return (
      <TouchableOpacity
        style={styles.followingButton}
        onPress={() => {
          openBottomSheet({
            content: (
              <MenuAction
                label="Unfollow"
                onPress={() => {
                  handleUnfollow();
                  closeBottomSheet();
                }}
                iconProps={{ xml: unfollowIcon() }}
              />
            ),
          });
        }}
      >
        <SvgXml
          width={20}
          height={20}
          xml={followingIcon()}
          color={theme.colors.secondary}
        />
        <Typography.BodyBold style={styles.followingText}>
          Following
        </Typography.BodyBold>
      </TouchableOpacity>
    );
  };

  const renderUnBlockButton = () => {
    return (
      <TouchableOpacity
        style={styles.userProfileFollowButton}
        onPress={() => unblockUser(userName)}
      >
        <SvgXml
          width={20}
          height={20}
          xml={unblockIcon()}
          color={theme.colors.base}
        />
        <Text style={styles.editProfileText}>Unblock</Text>
      </TouchableOpacity>
    );
  };

  const handleUnfollow = () => {
    return socialSettings === 'private'
      ? Alert.alert(
          'Unfollow user?',
          `You will no longer see posts from ${userName} in your feed. They won't be notified that you've unfollowed them.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Unfollow',
              style: 'destructive',
              onPress: () => unfollowUser(userId),
            },
          ]
        )
      : unfollowUser(userId);
  };

  const renderCancelRequestButton = () => {
    return (
      <TouchableOpacity
        style={styles.userProfileFollowButton}
        onPress={() => unfollowUser(userId)}
      >
        <SvgXml
          width={24}
          height={20}
          xml={cancelFollowRequest(theme.colors.base)}
        />
        <Text style={styles.editProfileText}>Cancel request</Text>
      </TouchableOpacity>
    );
  };

  const renderButtons = () => {
    if (isMyProfile) return null;
    if (isUnfollowed) return renderFollowButton();
    if (isPending) return renderCancelRequestButton();
    if (isBlocked) return renderUnBlockButton();
    if (isAccepted) return renderFollowingButton();
    return null;
  };

  return <>{renderButtons()}</>;
};

export default FollowButton;
