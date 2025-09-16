import * as z from 'zod';
import React from 'react';
import { useStyles } from './styles';
import Header from './components/Header';
import { Switch, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '~/v4/component/Typography/Typography';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';

type CommunityStorySettingProps = {
  community: Amity.Community;
};

const schema = z.object({
  storySetting: z.boolean(),
});

type CommunityStorySettingFormValues = z.infer<typeof schema>;

const useCommunityStorySetting = ({
  community,
}: CommunityStorySettingProps) => {
  const { styles, theme } = useStyles();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, isValid },
  } = useForm<CommunityStorySettingFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: { storySetting: community.allowCommentInStory },
  });

  const { mutateAsync } = useMutation<
    Amity.Cached<Amity.Community>,
    Error,
    CommunityStorySettingFormValues
  >({
    mutationFn: (payload) =>
      CommunityRepository.updateCommunity(community.communityId, {
        storySetting: { enableComment: payload.storySetting },
      }),
  });

  const onSubmit = async (data: CommunityStorySettingFormValues) => {
    await mutateAsync(data);
  };

  return {
    styles,
    theme,
    control,
    handleSubmit,
    disabled: !isDirty || !isValid || isSubmitting,
    onSubmit,
  };
};

const CommunityStorySetting = ({ community }: CommunityStorySettingProps) => {
  const { styles, control, theme, handleSubmit, onSubmit } =
    useCommunityStorySetting({ community });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <Controller
        control={control}
        name="storySetting"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchContainer}>
            <View style={styles.labelContainer}>
              <Typography.BodyBold style={styles.colorBase}>
                Allow comments on community stories
              </Typography.BodyBold>
              <Typography.Caption style={styles.colorBaseShade1}>
                Turn on to receive comments on stories in this community.
              </Typography.Caption>
            </View>
            <Switch
              value={value}
              thumbColor={theme.colors.background}
              ios_backgroundColor={theme.colors.baseShade3}
              trackColor={{
                false: theme.colors.baseShade3,
                true: theme.colors.primary,
              }}
              onValueChange={(selected) => {
                onChange(selected);
                handleSubmit(onSubmit)();
              }}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default CommunityStorySetting;
