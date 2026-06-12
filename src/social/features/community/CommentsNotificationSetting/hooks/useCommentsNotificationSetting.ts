import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { useStyles } from '../styles';
import { useAmityPage } from '../../../../hooks';
import { PageID } from '../../../../enums';
import { useCommunityNotificationSettingsQuery } from '../../../../hooks/queries/useCommunityNotificationSettingsQuery';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { TOAST } from '../../../../../core/constants';
import { CommunityNotificationEventNameEnum } from '@amityco/ts-sdk-react-native';
import { NOTIFICATION_RADIO_OPTIONS } from '../../shared/constants';
import {
  buildNotificationEvent,
  getNotificationEventValue,
} from '../../shared/utils';

const schema = z.object({
  reactComments: z.enum(Object.values(NOTIFICATION_RADIO_OPTIONS)),
  newComments: z.enum(Object.values(NOTIFICATION_RADIO_OPTIONS)),
  replies: z.enum(Object.values(NOTIFICATION_RADIO_OPTIONS)),
});

type FormValues = z.infer<typeof schema>;

type Props = RootStackParamList['CommunityCommentsNotificationSetting'];

export function useCommentsNotificationSetting({ community }: Props) {
  const { styles } = useStyles();
  const { showToast } = useToast();
  const { accessibilityId } = useAmityPage({
    pageId: PageID.community_comments_notification_page,
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
            reactComments: getNotificationEventValue(
              settings.events,
              CommunityNotificationEventNameEnum.COMMENT_REACTED
            ),
            newComments: getNotificationEventValue(
              settings.events,
              CommunityNotificationEventNameEnum.COMMENT_CREATED
            ),
            replies: getNotificationEventValue(
              settings.events,
              CommunityNotificationEventNameEnum.COMMENT_REPLIED
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
      title: 'React comments',
      description:
        'Receive notifications when someone like your comment in this community.',
      radio: {
        name: 'reactComments',
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
      title: 'New comments',
      description:
        'Receive notifications when someone comment to your posts in this community.',
      radio: {
        name: 'newComments',
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
      title: 'Replies',
      description:
        'Receive notifications when someone comment to your comments in this community.',
      radio: {
        name: 'replies',
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
            CommunityNotificationEventNameEnum.COMMENT_REACTED,
            data.reactComments
          ),
          buildNotificationEvent(
            CommunityNotificationEventNameEnum.COMMENT_CREATED,
            data.newComments
          ),
          buildNotificationEvent(
            CommunityNotificationEventNameEnum.COMMENT_REPLIED,
            data.replies
          ),
        ],
      });
      navigation.navigate('CommunityProfilePage', {
        communityId: community.communityId,
      });
      showToast({
        type: 'success',
        message: TOAST.COMMUNITY.PROFILE.UPDATE.SUCCESS,
      });
    } catch {
      showToast({
        type: 'informative',
        message: TOAST.COMMUNITY.PROFILE.UPDATE.FAILED,
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
