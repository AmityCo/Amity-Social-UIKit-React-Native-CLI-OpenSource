import React from 'react';
import { Alert } from 'react-native';
import { cancelFollowRequest } from '~/v4/../svg/svg-xml-list';
import {
  following as followingIcon,
  unfollow as unfollowIcon,
  unblock as unblockIcon,
} from '~/v4/assets/icons';
import { useBottomSheet } from '~/redux/slices/bottomSheetSlice';
import MenuAction from '~/v4/elements/MenuAction';
import { useStyles } from './styles';
import ActionButton from '~/v4/elements/ActionButton';
import { plus } from '~/v4/assets/icons';
import { ComponentID, ElementID, PageID } from '~/v4/enum';

interface FollowButtonProps {
  pageId?: PageID;
  componentId?: ComponentID;
  userId: string;
  followStatus: string | null;
  userName?: string;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  unblockUser: (userName?: string) => void;
  socialSettings?: 'public' | 'private';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  userId,
  followStatus,
  userName,
  followUser,
  unfollowUser,
  unblockUser,
  socialSettings,
}) => {
  const styles = useStyles();

  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  const isMyProfile = !followStatus;
  const isBlocked = followStatus === 'blocked';
  const isUnfollowed = followStatus === 'none';
  const isPending = followStatus === 'pending';
  const isAccepted = followStatus === 'accepted';

  const renderFollowButton = () => {
    return (
      <ActionButton
        pageId={pageId}
        componentId={componentId}
        elementId={ElementID.follow_user_button}
        onPress={() => followUser(userId)}
        icon={plus()}
        style={styles.userProfileFollowButton}
      />
    );
  };

  const renderFollowingButton = () => {
    return (
      <ActionButton
        pageId={pageId}
        componentId={componentId}
        elementId={ElementID.following_user_button}
        onPress={() => {
          openBottomSheet({
            content: (
              <MenuAction
                label="Unfollow"
                onPress={() => {
                  handleUnfollow();
                  closeBottomSheet();
                }}
                iconProps={{
                  xml: unfollowIcon(),
                }}
              />
            ),
          });
        }}
        icon={followingIcon()}
        type="secondary"
        style={styles.userProfileFollowButton}
      />
    );
  };

  const renderUnBlockButton = () => {
    return (
      <ActionButton
        pageId={pageId}
        componentId={componentId}
        elementId={ElementID.unblock_user_button}
        onPress={() => unblockUser(userName)}
        icon={unblockIcon()}
        type="secondary"
        style={styles.userProfileFollowButton}
      />
    );
  };

  const renderCancelRequestButton = () => {
    return (
      <ActionButton
        pageId={pageId}
        componentId={componentId}
        elementId={ElementID.pending_user_button}
        onPress={() => unfollowUser(userId)}
        icon={cancelFollowRequest()}
        type="secondary"
        style={styles.userProfileFollowButton}
      />
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
