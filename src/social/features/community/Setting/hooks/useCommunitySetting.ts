import { Alert } from 'react-native';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useBehaviour } from '../../../../providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { useMutation } from '@tanstack/react-query';
import { ERROR_CODE } from '../../../../../core/constants';
import { useStyles } from '../styles';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { useCustomRankingGlobalFeed } from '../../../../hooks/useCustomRankingGlobalFeed';
import { useCommunityNotificationSettingsQuery } from '../../../../hooks/queries/useCommunityNotificationSettingsQuery';

export function useCommunitySetting(community: Amity.Community) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CommunitySetting'>
    >();
  const { AmityCommunitySettingPageBehavior } = useBehaviour();
  const { showToast } = useToast();
  const { refresh, globalFeedPosts } = useCustomRankingGlobalFeed({
    enabled: false,
  });

  const { data: notificationSettings } = useCommunityNotificationSettingsQuery({
    communityId: community.communityId,
  });

  const { mutate: leaveCommunity } = useMutation({
    mutationFn: async () =>
      await CommunityRepository.leaveCommunity(community.communityId),
    onSuccess: () => {
      navigation.goBack();
      showToast({ message: 'Successfully left the group', type: 'success' });
      globalFeedPosts.length === 0 && setTimeout(() => refresh(), 3000);
    },
    onError: (error) => {
      if (error.message.includes(ERROR_CODE.ONLY_ONE_MODERATOR)) {
        Alert.alert(
          'Unable to leave community',
          "You're the only moderator in this group. To leave community, nominate other members to moderator role."
        );
      } else {
        Alert.alert(
          'Unable to leave community',
          'Something went wrong. Please try again later'
        );
      }
    },
  });

  const { mutate: closeCommunity } = useMutation({
    mutationFn: async () =>
      await CommunityRepository.deleteCommunity(community.communityId),
    onSuccess: () => {
      navigation.replace('AmitySocialHomePage');
    },
    onError: () => {
      Alert.alert(
        'Unable to close community',
        'Something went wrong. Please try again later.'
      );
    },
  });

  const handleCloseCommunity = async () => {
    Alert.alert(
      'Close community?',
      'All members will be removed from the community. All posts, messages, reactions, and media shared in community will be deleted. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => closeCommunity(),
        },
      ]
    );
  };

  const handleLeaveCommunity = () => {
    Alert.alert(
      'Leave community',
      'Leave the community. You will no longer be able to post and interact in this community.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          onPress: () => leaveCommunity(),
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditCommunity = () => {
    if (AmityCommunitySettingPageBehavior.goToEditCommunityPage) {
      return AmityCommunitySettingPageBehavior.goToEditCommunityPage({
        community,
      });
    }
    navigation.navigate('EditCommunity', { community });
  };

  const handleCommunityMembership = () => {
    if (AmityCommunitySettingPageBehavior.goToMembershipPage) {
      return AmityCommunitySettingPageBehavior.goToMembershipPage({
        community,
      });
    }
    navigation.navigate('CommunityMembership', { community });
  };

  const handleCommunityPostPermission = () => {
    if (AmityCommunitySettingPageBehavior.goToPostPermissionPage) {
      return AmityCommunitySettingPageBehavior.goToPostPermissionPage({
        community,
      });
    }
    navigation.navigate('CommunityPostPermission', { community });
  };

  const handleCommunityStorySetting = () => {
    if (AmityCommunitySettingPageBehavior.goToStorySettingPage) {
      return AmityCommunitySettingPageBehavior.goToStorySettingPage({
        community,
      });
    }
    navigation.navigate('CommunityStorySetting', { community });
  };

  const isNetworkNotificationsEnabled =
    !notificationSettings ||
    notificationSettings.events.length === 0 ||
    notificationSettings.events.some((e) => e.isNetworkEnabled !== false);

  const handleCommunityNotificationSetting = () => {
    if (AmityCommunitySettingPageBehavior.goToNotificationPage) {
      return AmityCommunitySettingPageBehavior.goToNotificationPage({
        community,
      });
    }
    navigation.navigate('CommunityNotificationSetting', { community });
  };

  return {
    styles,
    handleCloseCommunity,
    handleLeaveCommunity,
    handleEditCommunity,
    handleCommunityMembership,
    handleCommunityPostPermission,
    handleCommunityStorySetting,
    handleCommunityNotificationSetting,
    isNotificationEnabled: notificationSettings?.isEnabled ?? false,
    isNetworkNotificationsEnabled,
  };
}
