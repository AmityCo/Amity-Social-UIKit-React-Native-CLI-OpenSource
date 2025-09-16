import React, { useMemo } from 'react';
import { View } from 'react-native';
import Avatar from '~/v4/component/Avatar';
import { useStyles } from './style';
import { Typography } from '~/v4/component/Typography/Typography';
import MenuButton from '~/v4/elements/MenuButton';
import useAuth from '~/hooks/useAuth';
import { useBottomSheet } from '~/redux/slices/bottomSheetSlice';
import MenuAction from '~/v4/elements/MenuAction';
import { MemberRoles } from '~/v4/constants';
import { useToast } from '~/v4/stores/slices/toast';
import { demote, promote, report, trash, unreport } from '~/v4/assets/icons';
import { checkEditRolePermission, isModerator } from '~/v4/utils/permissions';
import {
  useRolesQuery,
  useMembersQuery,
  useUserFlaggedByMeQuery,
} from '~/v4/hook';

type MemberItemProps = {
  member: Amity.Membership<'community'>;
  communityId: Amity.Community['communityId'];
  refreshMembers?: () => void;
};

function useMemberItem({
  member,
  communityId,
  refreshMembers,
}: MemberItemProps) {
  const { styles } = useStyles();
  const { client } = useAuth();
  const { openBottomSheet, open, closeBottomSheet } = useBottomSheet();
  const { showToast } = useToast();
  const { addRoles, removeRoles } = useRolesQuery();
  const { removeMembers } = useMembersQuery();
  const {
    isFlaggedByMe,
    isLoading: isFlaggedByMeLoading,
    flagUser,
    unflagUser,
    refetch,
  } = useUserFlaggedByMeQuery({
    userId: member.userId,
    enabled: open,
  });

  const addModeratorRoles = () => {
    addRoles(
      {
        communityId,
        roles: [MemberRoles.COMMUNITY_MODERATOR, MemberRoles.CHANNEL_MODERATOR],
        userIds: [member.userId],
      },
      {
        onSuccess: () => {
          refreshMembers?.();
          showToast({
            type: 'success',
            message: 'Successfully promoted to moderator.',
          });
        },
        onError: () => {
          refreshMembers?.();
          showToast({
            type: 'informative',
            message: 'Failed to promote member. Please try again.',
          });
        },
      }
    );
  };

  const removeModeratorRoles = () => {
    removeRoles(
      {
        communityId,
        roles: [MemberRoles.COMMUNITY_MODERATOR, MemberRoles.CHANNEL_MODERATOR],
        userIds: [member.userId],
      },
      {
        onSuccess: () => {
          refreshMembers?.();
          showToast({
            type: 'success',
            message: 'Successfully demoted to member.',
          });
        },
        onError: () => {
          refreshMembers?.();
          showToast({
            type: 'informative',
            message: 'Failed to demote member. Please try again.',
          });
        },
      }
    );
  };

  const flag = () => {
    flagUser(member.userId, {
      onSuccess: () => {
        refetch();
        showToast({
          type: 'success',
          message: 'User reported.',
        });
      },
      onError: () => {
        showToast({
          type: 'informative',
          message: 'Failed to report user. Please try again.',
        });
      },
    });
  };

  const unflag = () => {
    unflagUser(member.userId, {
      onSuccess: () => {
        refetch();
        showToast({
          type: 'success',
          message: 'User unreported.',
        });
      },
      onError: () => {
        showToast({
          type: 'informative',
          message: 'Failed to unreport user. Please try again.',
        });
      },
    });
  };

  const removeMember = () => {
    removeMembers(
      {
        communityId,
        userIds: [member.userId],
      },
      {
        onSuccess: () => {
          refreshMembers?.();
          showToast({
            type: 'success',
            message: 'Member removed from this community.',
          });
        },
        onError: () => {
          refreshMembers?.();
          showToast({
            type: 'informative',
            message: 'Failed to remove member. Please try again.',
          });
        },
      }
    );
  };

  const isCurrentUser = client?.userId === member.userId;

  const isModeratorUser = isModerator(member.roles);

  const isCurrentUserModerator = useMemo(
    () => checkEditRolePermission(communityId),
    [communityId]
  );

  return {
    styles,
    isCurrentUser,
    addModeratorRoles,
    removeModeratorRoles,
    openBottomSheet,
    closeBottomSheet,
    isFlaggedByMe,
    flag,
    unflag,
    removeMember,
    isModeratorUser,
    isCurrentUserModerator,
    isFlaggedByMeLoading,
  };
}

function MemberItem({ member, communityId, refreshMembers }: MemberItemProps) {
  const {
    isCurrentUser,
    styles,
    openBottomSheet,
    closeBottomSheet,
    addModeratorRoles,
    removeModeratorRoles,
    flag,
    isFlaggedByMe,
    unflag,
    removeMember,
    isModeratorUser,
    isCurrentUserModerator,
  } = useMemberItem({
    member,
    communityId,
    refreshMembers,
  });

  return (
    <View style={styles.container}>
      <View style={styles.userContainer}>
        <Avatar.User
          imageStyle={styles.userAvatar}
          uri={member.user?.avatarCustomUrl}
          roles={member.roles}
          userName={member.user?.displayName ?? member.user?.userId}
        />
        <Typography.BodyBold
          style={styles.userName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {member?.user.displayName}
        </Typography.BodyBold>
      </View>
      {!isCurrentUser && (
        <MenuButton
          onPress={() => {
            openBottomSheet({
              height: isCurrentUserModerator ? 240 : 140,
              content: (
                <View>
                  {isCurrentUserModerator && (
                    <>
                      {isModeratorUser ? (
                        <MenuAction
                          label="Demote to member"
                          iconProps={{ xml: demote() }}
                          testID="demote-to-member-button"
                          onPress={() => {
                            closeBottomSheet();
                            removeModeratorRoles();
                          }}
                        />
                      ) : (
                        <MenuAction
                          label="Promote to moderator"
                          iconProps={{ xml: promote() }}
                          testID="promote-to-moderator-button"
                          onPress={() => {
                            closeBottomSheet();
                            addModeratorRoles();
                          }}
                        />
                      )}
                    </>
                  )}
                  {isFlaggedByMe ? (
                    <MenuAction
                      label="Unreport user"
                      testID="unreport-user-button"
                      iconProps={{ xml: unreport() }}
                      onPress={() => {
                        closeBottomSheet();
                        unflag();
                      }}
                    />
                  ) : (
                    <MenuAction
                      label="Report user"
                      testID="report-user-button"
                      iconProps={{ xml: report() }}
                      onPress={() => {
                        closeBottomSheet();
                        flag();
                      }}
                    />
                  )}
                  {isCurrentUserModerator && (
                    <MenuAction
                      danger
                      iconProps={{ xml: trash() }}
                      label="Remove from community"
                      testID="remove-from-community-button"
                      onPress={() => {
                        closeBottomSheet();
                        removeMember();
                      }}
                    />
                  )}
                </View>
              ),
            });
          }}
        />
      )}
    </View>
  );
}

export default MemberItem;
