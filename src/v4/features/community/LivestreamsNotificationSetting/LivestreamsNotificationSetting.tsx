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

type CommunityLivestreamsNotificationSettingProps = {
  community: Amity.Community;
};

const schema = z.object({
  newLivestream: z.enum(['Everyone', 'Only moderator', 'Off']),
});

type CommunityLivestreamsNotificationSettingFormValues = z.infer<typeof schema>;

const useCommunityLivestreamsNotificationSetting = ({
  community,
}: CommunityLivestreamsNotificationSettingProps) => {
  const { styles, theme } = useStyles();
  const { showToast } = useToast();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList,
        'CommunityLivestreamsNotificationSetting'
      >
    >();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<CommunityLivestreamsNotificationSettingFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: {
      newLivestream: 'Everyone',
    },
  });

  const { mutateAsync } = useMutation<
    Amity.Cached<Amity.Community>,
    Error,
    CommunityLivestreamsNotificationSettingFormValues
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
    data: CommunityLivestreamsNotificationSettingFormValues
  ) => {
    await mutateAsync(data);
  };

  const notifications = useMemo(
    () =>
      [
        {
          title: 'Live streams',
          description:
            'Receive notifications when someone starts a live stream in this community.',
          radio: {
            name: 'newLivestream',
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

const CommunityLivestreamsNotificationSetting = ({
  community,
}: CommunityLivestreamsNotificationSettingProps) => {
  const {
    styles,
    control,
    notifications,
    disabled,
    isDirty,
    onSubmit,
    handleSubmit,
  } = useCommunityLivestreamsNotificationSetting({
    community,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        isFormDirty={isDirty}
        onSave={handleSubmit(onSubmit)}
        disabled={disabled}
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

export default CommunityLivestreamsNotificationSetting;
