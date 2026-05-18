import { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../core/routes/RouteParamList';
import Avatar from '../../../../../components/Avatar';
import { useStyles } from './style';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import MenuButton from '../../../../../elements/MenuButton';
import useAuth from '../../../../../../core/hooks/useAuth';
import { useBottomSheet } from '../../../../../../core/stores/slices/bottomSheetSlice';
import MenuAction from '../../../../../elements/MenuAction';
import { MemberRoles } from '../../../../../../core/constants';
import { useToast } from '../../../../../../core/stores/slices/toastSlice';
import {
  demote,
  promote,
  report,
  trash,
  unreport,
} from '../../../../../../core/assets/icons';
import {
  checkEditRolePermission,
  isModerator,
} from '../../../../../utils/permissions';
import {
  useRolesQuery,
  useMembersQuery,
  useUserFlaggedByMeQuery,
} from '../../../../../hooks';
import { BrandBadge } from '../../../../../elements/BrandBadge';

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
    reportUser,
    unreportUser,
  } = useUserFlaggedByMeQuery({
    userId: member.userId,
    enabled: open,
  });
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  const flag = () => reportUser(member.userId);
  const unflag = () => unreportUser(member.userId);

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

  const goToUserProfile = () => {
    navigation.navigate('UserProfile', { userId: member.userId });
  };

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
    goToUserProfile,
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
    goToUserProfile,
  } = useMemberItem({
    member,
    communityId,
    refreshMembers,
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.userContainer} onPress={goToUserProfile}>
        <Avatar.User
          imageStyle={styles.userAvatar}
          uri={member.user?.avatarCustomUrl}
          roles={member.roles}
          userName={member.user?.displayName ?? member.user?.userId}
          userId={member.userId}
        />
        <View style={styles.displayNameContainer}>
          <Typography.BodyBold
            style={styles.userName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {member?.user.displayName}
          </Typography.BodyBold>
          {member?.user?.isBrand && (
            <BrandBadge
              width={20}
              height={20}
              accessible
              accessibilityLabel="Brand verified"
            />
          )}
        </View>
      </TouchableOpacity>
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
