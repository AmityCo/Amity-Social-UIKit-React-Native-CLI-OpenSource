import { useStyles } from '../styles';
import { useAmityElement } from '../../../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../../../enums';
import { useNavigation } from '@react-navigation/native';
import {
  block,
  pen,
  report,
  unreport,
} from '../../../../../../../core/assets/icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';
import { useBottomSheet } from '../../../../../../../core/stores/slices/bottomSheetSlice';
import useAuth from '../../../../../../../core/hooks/useAuth';
import { useUserFlaggedByMeQuery } from '../../../../../../hooks/queries/useFlagUserQuery';
import { useBlockUser } from '../../../../../../hooks/queries/useBlockUser';
import { useFollowInfo } from '../../../../../../hooks/objects';
import { useBehaviour } from '../../../../../../providers/BehaviourProvider';

type UseTopBarParams = {
  userId?: string;
  displayName?: string;
  isFromComponent?: boolean;
};

export function useTopBar({
  userId,
  displayName,
  isFromComponent,
}: UseTopBarParams) {
  const { styles } = useStyles();
  const pageId = PageID.user_profile_page;
  const { accessibilityId: backButtonId } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.back_button,
  });
  const { accessibilityId: menuButtonId } = useAmityElement({
    pageId,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.menu_button,
  });
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { client } = useAuth();
  const { AmityUserProfilePageBehavior } = useBehaviour();
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

  const handleGoBack = () => {
    const routes = navigation.getState().routes;
    if (isFromComponent && routes.length === 1) {
      navigation.navigate('AmitySocialHomePage');
    } else {
      navigation.goBack();
    }
  };

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
        if (userId) reportUser(userId);
        closeBottomSheet();
      },
    },
    {
      visible: !isMyProfile && !!isFlaggedByMe,
      label: 'Unreport user',
      iconProps: { xml: unreport() },
      testID: 'unreport-user-button',
      accessibilityLabel: 'Unreport user',
      onPress: () => {
        if (userId) unreportUser(userId);
        closeBottomSheet();
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
        if (userId) blockUser(userId, displayName ?? userId);
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
        if (userId) unBlockUser(userId, displayName ?? userId);
      },
    },
  ].filter((action) => action.visible);

  return {
    styles,
    actions,
    openBottomSheet,
    bottomSheetHeight,
    handleGoBack,
    backButtonId,
    menuButtonId,
  };
}
