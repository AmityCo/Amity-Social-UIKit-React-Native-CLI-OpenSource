import { Alert } from 'react-native';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useBehaviour } from '~/v4/providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { useMutation } from '@tanstack/react-query';
import { ERROR_CODE } from '~/v4/constants';
import { useStyles } from '../styles';
import { useToast } from '~/v4/stores/slices/toast';

export function useCommunitySetting(community: Amity.Community) {
  const { styles } = useStyles();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CommunitySetting'>
    >();
  const { AmityCommunitySettingPageBehavior } = useBehaviour();
  const { showToast } = useToast();

  const { mutate: leaveCommunity } = useMutation({
    mutationFn: async () =>
      await CommunityRepository.leaveCommunity(community.communityId),
    onSuccess: () => {
      navigation.goBack();
      showToast({ message: 'Successfully left the group', type: 'success' });
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
      navigation.replace('Home');
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
  };
}
81200;
