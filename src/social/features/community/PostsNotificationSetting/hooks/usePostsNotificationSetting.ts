import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CommunityNotificationEventNameEnum } from '@amityco/ts-sdk-react-native';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { useStyles } from '../styles';
import { useAmityPage } from '../../../../hooks';
import { PageID } from '../../../../enums';
import { useCommunityNotificationSettingsQuery } from '../../../../hooks/queries/useCommunityNotificationSettingsQuery';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { TOAST } from '../../../../../core/constants';
import { NOTIFICATION_RADIO_OPTIONS } from '../../shared/constants';
import {
  buildNotificationEvent,
  getNotificationEventValue,
} from '../../shared/utils';

const schema = z.object({
  reactPosts: z.enum(Object.values(NOTIFICATION_RADIO_OPTIONS)),
  newPosts: z.enum(Object.values(NOTIFICATION_RADIO_OPTIONS)),
});

type FormValues = z.infer<typeof schema>;

type PostsNotificationSettingProps =
  RootStackParamList['CommunityPostsNotificationSetting'];

export function usePostsNotificationSetting({
  community,
}: PostsNotificationSettingProps) {
  const { styles } = useStyles();
  const { showToast } = useToast();
  const { accessibilityId } = useAmityPage({
    pageId: PageID.community_posts_notification_page,
  });
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    isLoading,
    isPending,
    data: settings,
    enableNotifications,
  } = useCommunityNotificationSettingsQuery({
    communityId: community.communityId,
  });

  const formValues = useMemo<FormValues | undefined>(
    () =>
      settings
        ? {
            reactPosts: getNotificationEventValue(
              settings.events,
              CommunityNotificationEventNameEnum.POST_REACTED
            ),
            newPosts: getNotificationEventValue(
              settings.events,
              CommunityNotificationEventNameEnum.POST_CREATED
            ),
          }
        : undefined,
    [settings]
  );

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: formValues,
  });

  const notifications = [
    {
      title: 'React posts',
      description:
        'Receive notifications when someone make a reaction to your posts in this community.',
      radio: {
        name: 'reactPosts',
        items: [
          {
            label: NOTIFICATION_RADIO_OPTIONS.everyone,
            value: NOTIFICATION_RADIO_OPTIONS.everyone,
          },
          {
            label: NOTIFICATION_RADIO_OPTIONS.onlyModerator,
            value: NOTIFICATION_RADIO_OPTIONS.onlyModerator,
          },
          {
            label: NOTIFICATION_RADIO_OPTIONS.off,
            value: NOTIFICATION_RADIO_OPTIONS.off,
          },
        ],
      },
    },
    {
      title: 'New posts',
      description:
        'Receive notifications when someone create new posts in this community.',
      radio: {
        name: 'newPosts',
        items: [
          {
            label: NOTIFICATION_RADIO_OPTIONS.everyone,
            value: NOTIFICATION_RADIO_OPTIONS.everyone,
          },
          {
            label: NOTIFICATION_RADIO_OPTIONS.onlyModerator,
            value: NOTIFICATION_RADIO_OPTIONS.onlyModerator,
          },
          {
            label: NOTIFICATION_RADIO_OPTIONS.off,
            value: NOTIFICATION_RADIO_OPTIONS.off,
          },
        ],
      },
    },
  ] as const;

  const onSubmit = async (data: FormValues) => {
    try {
      await enableNotifications({
        communityId: community.communityId,
        events: [
          buildNotificationEvent(
            CommunityNotificationEventNameEnum.POST_REACTED,
            data.reactPosts
          ),
          buildNotificationEvent(
            CommunityNotificationEventNameEnum.POST_CREATED,
            data.newPosts
          ),
        ],
      });
      navigation.goBack();
    } catch {
      showToast({
        type: 'informative',
        message: TOAST.COMMUNITY.NOTIFICATION.UPDATE.FAILED,
      });
    }
  };

  return {
    styles,
    control,
    isDirty,
    onSubmit,
    isLoading,
    handleSubmit,
    notifications,
    accessibilityId,
    disabled: !isDirty || !isValid || isSubmitting || isPending,
  };
}
