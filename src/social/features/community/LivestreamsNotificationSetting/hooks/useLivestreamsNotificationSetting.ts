import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CommunityNotificationEventNameEnum } from '../../shared/notificationSettingsCompat';
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
  newLivestream: z.enum(Object.values(NOTIFICATION_RADIO_OPTIONS)),
});

type FormValues = z.infer<typeof schema>;

type LivestreamsNotificationSettingProps =
  RootStackParamList['CommunityLivestreamsNotificationSetting'];

export function useLivestreamsNotificationSetting({
  community,
}: LivestreamsNotificationSettingProps) {
  const { styles } = useStyles();
  const { showToast } = useToast();
  const { accessibilityId } = useAmityPage({
    pageId: PageID.community_livestreams_notification_page,
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
            newLivestream: getNotificationEventValue(
              settings.events,
              CommunityNotificationEventNameEnum.LIVESTREAM_START
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
      title: 'Live streams',
      description:
        'Receive notifications when someone starts a live stream in this community.',
      radio: {
        name: 'newLivestream',
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
            CommunityNotificationEventNameEnum.LIVESTREAM_START,
            data.newLivestream
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
