import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  commentNotification,
  livestream,
  postNotification,
  story,
} from '../../../../../core/assets/icons';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { useBehaviour } from '../../../../providers/BehaviourProvider';
import { useCommunityNotificationSettingsQuery } from '../../../../hooks/queries/useCommunityNotificationSettingsQuery';
import { useStyles } from '../styles';
import { useAmityPage } from '../../../../hooks';
import { PageID } from '../../../../enums';
import { NotificationSettingProps } from '../NotificationSetting';

const schema = z.object({
  isEnabled: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function useNotificationSetting({
  community,
}: NotificationSettingProps) {
  const { styles, theme } = useStyles();
  const { accessibilityId } = useAmityPage({
    pageId: PageID.community_notification_page,
  });
  const { AmityCommunityNotificationSettingPageBehavior } = useBehaviour();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList,
        'CommunityNotificationSetting'
      >
    >();

  const {
    isLoading,
    isPending,
    data: settings,
    enableNotifications,
    disableNotifications,
  } = useCommunityNotificationSettingsQuery({
    communityId: community.communityId,
  });

  const { watch, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { isEnabled: settings?.isEnabled ?? false },
  });

  const isEnabled = watch('isEnabled');

  const handleToggle = (value: boolean) => {
    value
      ? enableNotifications({ communityId: community.communityId })
      : disableNotifications({ communityId: community.communityId });
  };

  const notificationActions = [
    {
      visible: true,
      label: 'Posts',
      iconProps: { xml: postNotification(), noContainer: true },
      onPress: () => {
        if (
          AmityCommunityNotificationSettingPageBehavior?.goToPostsNotificationSettingPage
        ) {
          return AmityCommunityNotificationSettingPageBehavior.goToPostsNotificationSettingPage(
            { community }
          );
        }
        navigation.navigate('CommunityPostsNotificationSetting', { community });
      },
    },
    {
      visible: true,
      label: 'Comments',
      iconProps: { xml: commentNotification(), noContainer: true },
      onPress: () => {
        if (
          AmityCommunityNotificationSettingPageBehavior?.goToCommentsNotificationSettingPage
        ) {
          return AmityCommunityNotificationSettingPageBehavior.goToCommentsNotificationSettingPage(
            { community }
          );
        }
        navigation.navigate('CommunityCommentsNotificationSetting', {
          community,
        });
      },
    },
    {
      visible: true,
      label: 'Stories',
      iconProps: { xml: story(), noContainer: true, width: 24, height: 24 },
      onPress: () => {
        if (
          AmityCommunityNotificationSettingPageBehavior?.goToStoriesNotificationSettingPage
        ) {
          return AmityCommunityNotificationSettingPageBehavior.goToStoriesNotificationSettingPage(
            { community }
          );
        }
        navigation.navigate('CommunityStoriesNotificationSetting', {
          community,
        });
      },
    },
    {
      // livestream notification setting is not supported yet in other platforms
      visible: false,
      label: 'Live streams',
      iconProps: {
        xml: livestream(),
        noContainer: true,
        width: 24,
        height: 24,
      },
      onPress: () => {
        if (
          AmityCommunityNotificationSettingPageBehavior?.goToLivestreamsNotificationSettingPage
        ) {
          return AmityCommunityNotificationSettingPageBehavior.goToLivestreamsNotificationSettingPage(
            { community }
          );
        }
        navigation.navigate('CommunityLivestreamsNotificationSetting', {
          community,
        });
      },
    },
  ].filter((item) => item.visible);

  return {
    theme,
    styles,
    control,
    isEnabled,
    isLoading,
    isPending,
    handleToggle,
    accessibilityId,
    notificationActions,
  };
}
