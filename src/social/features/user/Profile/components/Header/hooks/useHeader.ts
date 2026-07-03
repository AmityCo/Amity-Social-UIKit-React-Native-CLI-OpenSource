import { useState } from 'react';
import { TextLayoutEvent } from 'react-native';
import { useFollowInfo } from '../../../../../../hooks/objects';
import { formatCount } from '../../../../../../../core/utils/time';
import { useStyles } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';
import { UserRelationshipTab } from '../../../../../../types';
import { useBehaviour } from '../../../../../../providers/BehaviourProvider';
import { useBlockUser, useGlobalBehavior } from '../../../../../../hooks';
import useAuth from '../../../../../../../core/hooks/useAuth';
import { useFollowUser } from '../../../../../../hooks/queries/useFollowUser';
import useSocialSettings from '../../../../../../../core/hooks/useSocialSettings';
import { useBottomSheet } from '../../../../../../../core/stores/slices/bottomSheetSlice';
import { useToast } from '../../../../../../../core/stores/slices/toastSlice';
import { unfollow } from '../../../../../../../core/assets/icons';
import { TOAST } from '../../../../../../../core/constants';

export function useHeader(user?: Amity.User) {
  const BADGE_SIZE = 20;
  const BADGE_GAP = 6;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { AmityUserProfileHeaderComponentBehavior } = useBehaviour();
  const { unBlockUser } = useBlockUser();
  const { client } = useAuth();
  const { socialSettings } = useSocialSettings();
  const isPrivateNetwork = socialSettings?.userPrivacySetting === 'private';
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();
  const { showToast } = useToast();
  const { handleGlobalBehavior } = useGlobalBehavior();
  const {
    followUser,
    unfollowUser,
    isLoading: isFollowLoading,
  } = useFollowUser();

  const { followInfo } = useFollowInfo({
    userId: user?.userId ?? '',
    enabled: !!user?.userId,
  });

  const isMyProfile = client?.userId === user?.userId;
  const isBlockedByMe = followInfo?.status === 'blocked';
  const isFollowing = followInfo?.status === 'accepted';
  const isPending = followInfo?.status === 'pending';
  const pendingFollowRequestCount = followInfo?.pendingCount ?? 0;
  const showPendingBanner =
    isMyProfile && isPrivateNetwork && pendingFollowRequestCount > 0;

  const handleUnblock = () => {
    unBlockUser(user?.userId ?? '', user?.displayName ?? '');
  };

  const handleFollow = () => {
    if (!user?.userId) return;
    handleGlobalBehavior({
      defaultBehavior: () => followUser(user.userId),
    });
  };

  const handleUnfollow = () => {
    if (!user?.userId) return;
    unfollowUser(user.userId, { confirm: isPrivateNetwork });
  };

  const followingActions = [
    {
      label: 'Unfollow',
      iconProps: { xml: unfollow() },
      testID: 'unfollow-button',
      accessibilityLabel: 'Unfollow',
      onPress: () => {
        closeBottomSheet();
        handleUnfollow();
      },
    },
  ];

  const [badgePosition, setBadgePosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const { styles, theme } = useStyles({
    badgePaddingRight: user?.isBrand ? BADGE_SIZE + BADGE_GAP : 0,
    badgeTop: badgePosition?.top ?? 0,
    badgeLeft: badgePosition?.left ?? 0,
  });

  const onTextLayout = (e: TextLayoutEvent) => {
    const { lines } = e.nativeEvent;
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      setBadgePosition({
        top: lastLine.y + (lastLine.height - BADGE_SIZE) / 2,
        left: lastLine.width + BADGE_GAP,
      });
    }
  };

  const navigateToPendingFollowRequests = () => {
    if (AmityUserProfileHeaderComponentBehavior?.goToPendingFollowRequestPage) {
      AmityUserProfileHeaderComponentBehavior.goToPendingFollowRequestPage();
    } else {
      navigation.navigate('UserPendingFollowRequests');
    }
  };

  const navigateToRelationship = (tab: UserRelationshipTab) => {
    if (!user?.userId) return;
    handleGlobalBehavior({
      defaultBehavior: () => {
        if (!isMyProfile && isPrivateNetwork && !isFollowing) {
          showToast({
            type: 'informative',
            message: TOAST.USER.RELATIONSHIP.FOLLOW_TO_INTERACT,
          });
          return;
        }
        if (AmityUserProfileHeaderComponentBehavior?.goToUserRelationshipPage) {
          AmityUserProfileHeaderComponentBehavior.goToUserRelationshipPage({
            userId: user.userId,
            selectedTab: tab,
          });
        } else {
          navigation.push('UserRelationship', {
            userId: user.userId,
            selectedTab: tab,
          });
        }
      },
    });
  };

  return {
    styles,
    theme,
    onTextLayout,
    badgePosition,
    badgeSize: BADGE_SIZE,
    navigateToRelationship,
    showBadge: user?.isBrand,
    brandBadgeAccessibilityLabel: 'Brand verified',
    followingCount: formatCount(followInfo?.followingCount ?? 0),
    followerCount: formatCount(followInfo?.followerCount ?? 0),
    isMyProfile,
    isBlockedByMe,
    isFollowing,
    isPending,
    isFollowLoading,
    handleUnblock,
    handleFollow,
    handleUnfollow,
    followingActions,
    openBottomSheet,
    closeBottomSheet,
    bottomSheetHeight,
    showPendingBanner,
    pendingFollowRequestCount,
    navigateToPendingFollowRequests,
  };
}
