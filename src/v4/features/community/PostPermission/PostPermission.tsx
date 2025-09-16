import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/Header';
import { useStyles } from './styles';
import { Typography } from '~/v4/component/Typography/Typography';
import { View } from 'react-native';
import {
  CommunityPostSettings,
  CommunityRepository,
} from '@amityco/ts-sdk-react-native';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Radio } from '~/v4/component/core/Radio';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '~/v4/stores/slices/toast';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/v4/routes/RouteParamList';

type CommunityPostPermissionProps = {
  community: Amity.Community;
};

type PostPermission = ValueOf<
  Readonly<{
    ONLY_ADMIN_CAN_POST: 'ONLY_ADMIN_CAN_POST';
    ADMIN_REVIEW_POST_REQUIRED: 'ADMIN_REVIEW_POST_REQUIRED';
    ANYONE_CAN_POST: 'ANYONE_CAN_POST';
  }>
>;

const schema = z.object({
  postPermission: z.custom<PostPermission>(),
});

type CommunityPostPermissionFormValues = z.infer<typeof schema>;

const useCommunityPostPermission = ({
  community,
}: CommunityPostPermissionProps) => {
  const { styles } = useStyles();
  const { showToast } = useToast();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CommunityPostPermission'>
    >();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, isValid },
  } = useForm<CommunityPostPermissionFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: { postPermission: community.postSetting },
  });

  const { mutateAsync } = useMutation<
    Amity.Cached<Amity.Community>,
    Error,
    CommunityPostPermissionFormValues
  >({
    mutationFn: (payload) =>
      CommunityRepository.updateCommunity(community.communityId, {
        postSetting: payload.postPermission,
      }),
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

  const onSubmit = async (data: CommunityPostPermissionFormValues) => {
    await mutateAsync(data);
  };

  return {
    styles,
    control,
    handleSubmit,
    disabled: !isDirty || !isValid || isSubmitting,
    onSubmit,
  };
};

const CommunityPostPermission = ({
  community,
}: CommunityPostPermissionProps) => {
  const { styles, control, handleSubmit, onSubmit, disabled } =
    useCommunityPostPermission({ community });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onSave={handleSubmit(onSubmit)} disabled={disabled} />
      <View style={styles.labelContainer}>
        <Typography.BodyBold style={styles.colorBase}>
          Who can post on this community
        </Typography.BodyBold>
        <Typography.Caption style={styles.colorBaseShade1}>
          You can control who can create posts in your community.
        </Typography.Caption>
      </View>
      <Controller
        control={control}
        name="postPermission"
        render={({ field: { onChange, value } }) => (
          <Radio.Group<PostPermission> value={value} onChange={onChange}>
            <Radio.Option value={CommunityPostSettings.ANYONE_CAN_POST}>
              <Radio.Label>
                <Typography.Body>Everyone can post</Typography.Body>
              </Radio.Label>
              <Radio.Icon />
            </Radio.Option>
            <Radio.Option
              value={CommunityPostSettings.ADMIN_REVIEW_POST_REQUIRED}
            >
              <Radio.Label>
                <Typography.Body>Admin review post</Typography.Body>
              </Radio.Label>
              <Radio.Icon />
            </Radio.Option>
            <Radio.Option value={CommunityPostSettings.ONLY_ADMIN_CAN_POST}>
              <Radio.Label>
                <Typography.Body>Only admins can post</Typography.Body>
              </Radio.Label>
              <Radio.Icon />
            </Radio.Option>
          </Radio.Group>
        )}
      />
    </SafeAreaView>
  );
};

export default CommunityPostPermission;
