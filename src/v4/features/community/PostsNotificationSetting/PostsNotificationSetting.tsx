import * as z from 'zod';
import React, { useMemo } from 'react';
import { useStyles } from './styles';
import Header from './components/Header';
import { ScrollView, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '~/v4/component/Typography/Typography';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { Radio } from '~/v4/component/core/Radio';
import { useMutation } from '@tanstack/react-query';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useToast } from '~/v4/stores/slices/toast';

type CommunityPostsNotificationSettingProps = {
  community: Amity.Community;
};

const schema = z.object({
  reactPosts: z.enum(['Everyone', 'Only moderator', 'Off']),
  newPosts: z.enum(['Everyone', 'Only moderator', 'Off']),
});

type CommunityPostsNotificationSettingFormValues = z.infer<typeof schema>;

const useCommunityPostsNotificationSetting = ({
  community,
}: CommunityPostsNotificationSettingProps) => {
  const { styles, theme } = useStyles();
  const { showToast } = useToast();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList,
        'CommunityPostsNotificationSetting'
      >
    >();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<CommunityPostsNotificationSettingFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: { reactPosts: 'Everyone', newPosts: 'Everyone' },
  });

  const { mutateAsync } = useMutation<
    Amity.Cached<Amity.Community>,
    Error,
    CommunityPostsNotificationSettingFormValues
  >({
    mutationFn: () =>
      CommunityRepository.updateCommunity(community.communityId, {}),
    onSuccess: () => {
      navigation.navigate('CommunityProfilePage', {
        communityId: community.communityId,
      });
      showToast({
        type: 'success',
        message: 'Successfully updated community profile.',
      });
    },
    onError: () => {
      showToast({
        type: 'informative',
        message: 'Failed to save your community profile. Please try again.',
      });
    },
  });

  const onSubmit = async (
    data: CommunityPostsNotificationSettingFormValues
  ) => {
    await mutateAsync(data);
  };

  const notifications = useMemo(
    () =>
      [
        {
          title: 'React posts',
          description:
            'Receive notifications when someone make a reaction to your posts in this community. ',
          radio: {
            name: 'reactPosts',
            items: [
              { label: 'Everyone', value: 'Everyone' },
              { label: 'Only moderator', value: 'Only moderator' },
              { label: 'Off', value: 'Off' },
            ],
          },
        },
        {
          title: 'New posts',
          description:
            'Receive notifications when someone create new posts in this community. ',
          radio: {
            name: 'newPosts',
            items: [
              { label: 'Everyone', value: 'Everyone' },
              { label: 'Only moderator', value: 'Only moderator' },
              { label: 'Off', value: 'Off' },
            ],
          },
        },
      ] as const,
    []
  );

  return {
    styles,
    theme,
    control,
    notifications,
    disabled: !isDirty || !isValid || isSubmitting,
    handleSubmit,
    onSubmit,
    isDirty,
  };
};

const CommunityPostsNotificationSetting = ({
  community,
}: CommunityPostsNotificationSettingProps) => {
  const {
    styles,
    control,
    notifications,
    disabled,
    onSubmit,
    handleSubmit,
    isDirty,
  } = useCommunityPostsNotificationSetting({
    community,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        disabled={disabled}
        isFormDirty={isDirty}
        onSave={handleSubmit(onSubmit)}
      />
      <ScrollView style={styles.scrollContainer}>
        {notifications.map((item, index, list) => (
          <View key={item.radio.name}>
            <Controller
              control={control}
              name={item.radio.name}
              render={({ field: { onChange, value } }) => (
                <View>
                  <View style={styles.labelContainer}>
                    <Typography.BodyBold style={styles.colorBase}>
                      {item.title}
                    </Typography.BodyBold>
                    <Typography.Caption style={styles.colorBaseShade1}>
                      {item.description}
                    </Typography.Caption>
                  </View>
                  <Radio.Group value={value} onChange={onChange}>
                    {item.radio.items.map((radioItem) => (
                      <Radio.Option
                        key={radioItem.value}
                        value={radioItem.value}
                      >
                        <Radio.Label>
                          <Typography.Body>{radioItem.label}</Typography.Body>
                        </Radio.Label>
                        <Radio.Icon />
                      </Radio.Option>
                    ))}
                  </Radio.Group>
                </View>
              )}
            />
            {index !== list.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CommunityPostsNotificationSetting;
