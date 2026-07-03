import { useAmityElement } from '../../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../../enums';
import { useNavigation } from '@react-navigation/native';
import {
  block,
  pen,
  report,
  unreport,
} from '../../../../../../../core/assets/icons';
import { useShareableLink } from '../../../../../../../core/hooks/useShareableLink';
import { ShareableLinkModel } from '../../../../../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';
import { useBottomSheet } from '../../../../../../../core/stores/slices/bottomSheetSlice';
import useAuth from '../../../../../../../core/hooks/useAuth';
import { useUserFlaggedByMeQuery } from '../../../../../../hooks/queries/useFlagUserQuery';
import { useBlockUser } from '../../../../../../hooks/queries/useBlockUser';
import { useFollowInfo } from '../../../../../../hooks/objects';
import { useBehaviour } from '../../../../../../providers/BehaviourProvider';
import { useGlobalBehavior } from '../../../../../../hooks';

type UseMenuParams = {
  userId?: string;
  displayName?: string;
};

export function useMenu({ userId, displayName }: UseMenuParams) {
  const pageId = PageID.user_profile_page;

  const { client } = useAuth();
  const { getShareLink } = useShareableLink();
  const { handleGlobalBehavior } = useGlobalBehavior();
  const { AmityUserProfilePageBehavior } = useBehaviour();
  const { accessibilityId: menuButtonId } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.menu_button,
  });
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const shareLink = userId
    ? getShareLink(ShareableLinkModel.users, userId)
    : null;

  const isMyProfile = client?.userId === userId;

  const { isFlaggedByMe, reportUser, unreportUser } = useUserFlaggedByMeQuery({
    userId: userId ?? '',
    enabled: !isMyProfile && !!userId,
  });

  const { blockUser, unBlockUser } = useBlockUser();

  const { followInfo } = useFollowInfo({
    userId: userId ?? '',
    enabled: !isMyProfile && !!userId,
  });

  const isBlockedByMe = followInfo?.status === 'blocked';

  const actions = [
    {
      visible: isMyProfile,
      label: 'Edit profile',
      iconProps: { xml: pen() },
      testID: 'edit-profile-button',
      accessibilityLabel: 'Edit profile',
      onPress: () => {
        closeBottomSheet();
        if (AmityUserProfilePageBehavior?.goToEditUserPage) {
          AmityUserProfilePageBehavior.goToEditUserPage({ userId });
        } else {
          navigation.navigate('EditUser', { userId });
        }
      },
    },
    {
      visible: isMyProfile,
      label: 'Manage blocked users',
      iconProps: { xml: block() },
      testID: 'manage-blocked-users-button',
      accessibilityLabel: 'Manage blocked users',
      onPress: () => {
        closeBottomSheet();
        if (AmityUserProfilePageBehavior?.goToBlockedUsersPage) {
          AmityUserProfilePageBehavior.goToBlockedUsersPage();
        } else {
          navigation.navigate('BlockedUsers');
        }
      },
    },
    {
      visible: !isMyProfile && !isFlaggedByMe,
      label: 'Report user',
      iconProps: { xml: report() },
      testID: 'report-user-button',
      accessibilityLabel: 'Report user',
      onPress: () => {
        closeBottomSheet();
        handleGlobalBehavior({
          defaultBehavior: () => userId && reportUser(userId),
        });
      },
    },
    {
      visible: !isMyProfile && !!isFlaggedByMe,
      label: 'Unreport user',
      iconProps: { xml: unreport() },
      testID: 'unreport-user-button',
      accessibilityLabel: 'Unreport user',
      onPress: () => {
        closeBottomSheet();
        handleGlobalBehavior({
          defaultBehavior: () => userId && unreportUser(userId),
        });
      },
    },
    {
      visible: !isMyProfile && !isBlockedByMe,
      label: 'Block user',
      iconProps: { xml: block() },
      testID: 'block-user-button',
      accessibilityLabel: 'Block user',
      onPress: () => {
        closeBottomSheet();
        handleGlobalBehavior({
          defaultBehavior: () =>
            userId && blockUser(userId, displayName ?? userId),
        });
      },
    },
    {
      visible: !isMyProfile && isBlockedByMe,
      label: 'Unblock user',
      iconProps: { xml: block() },
      testID: 'unblock-user-button',
      accessibilityLabel: 'Unblock user',
      onPress: () => {
        closeBottomSheet();
        handleGlobalBehavior({
          defaultBehavior: () =>
            userId && unBlockUser(userId, displayName ?? userId),
        });
      },
    },
  ].filter((action) => action.visible);

  return {
    actions,
    shareLink,
    menuButtonId,
    openBottomSheet,
    bottomSheetHeight,
  };
}
