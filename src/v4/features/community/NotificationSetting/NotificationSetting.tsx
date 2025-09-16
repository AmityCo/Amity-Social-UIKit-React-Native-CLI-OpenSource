import * as z from 'zod';
import React from 'react';
import { useStyles } from './styles';
import Header from './components/Header';
import { Switch, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '~/v4/component/Typography/Typography';
import Action from '../shared/elements/Action';
import {
  commentNotification,
  livestream,
  postNotification,
  story,
} from '~/v4/assets/icons';
import { useBehaviour } from '~/v4/providers/BehaviourProvider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/v4/routes/RouteParamList';

type CommunityNotificationSettingProps = {
  community: Amity.Community;
};

const schema = z.object({
  notificationSetting: z.boolean(),
});

type CommunityNotificationSettingFormValues = z.infer<typeof schema>;

const useCommunityNotificationSetting = ({
  community,
}: CommunityNotificationSettingProps) => {
  const { styles, theme } = useStyles();
  const { AmityCommunityNotificationSettingPageBehavior } = useBehaviour();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList,
        'CommunityNotificationSetting'
      >
    >();

  const { control, watch } = useForm<CommunityNotificationSettingFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: { notificationSetting: community.allowCommentInStory },
  });

  const values = watch();

  const notifications = [
    {
      label: 'Posts',
      iconProps: {
        xml: postNotification(),
        noContainer: true,
      },
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
      label: 'Comments',
      iconProps: {
        xml: commentNotification(),
        noContainer: true,
      },
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
      label: 'Stories',
      iconProps: {
        xml: story(),
        noContainer: true,
        width: 24,
        height: 24,
      },
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
  ];

  return {
    styles,
    theme,
    control,
    notifications,
    values,
  };
};

const CommunityNotificationSetting = ({
  community,
}: CommunityNotificationSettingProps) => {
  const { styles, control, theme, values, notifications } =
    useCommunityNotificationSetting({
      community,
    });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <Controller
        control={control}
        name="notificationSetting"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchContainer}>
            <View style={styles.labelContainer}>
              <Typography.BodyBold style={styles.colorBase}>
                Allow notifications
              </Typography.BodyBold>
              <Typography.Caption style={styles.colorBaseShade1}>
                Turn on to receive push notifications from this community.
              </Typography.Caption>
            </View>
            <Switch
              value={value}
              onValueChange={onChange}
              thumbColor={theme.colors.background}
              ios_backgroundColor={theme.colors.baseShade3}
              trackColor={{
                false: theme.colors.baseShade3,
                true: theme.colors.primary,
              }}
            />
          </View>
        )}
      />
      {values.notificationSetting && (
        <>
          <View style={styles.divider} />
          {notifications.map((item) => (
            <Action key={item.label} {...item} />
          ))}
        </>
      )}
    </SafeAreaView>
  );
};

export default CommunityNotificationSetting;
