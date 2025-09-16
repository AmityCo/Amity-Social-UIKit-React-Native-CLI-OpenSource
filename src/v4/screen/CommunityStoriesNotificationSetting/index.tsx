import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityStoriesNotificationSettingPage from '~/v4/PublicApi/Pages/AmityCommunityStoriesNotificationSettingPage';

type CommunityStoriesNotificationSettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityStoriesNotificationSetting'
>;

function CommunityStoriesNotificationSetting(
  _: CommunityStoriesNotificationSettingProps
) {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityStoriesNotificationSetting'>
    >();

  return (
    <AmityCommunityStoriesNotificationSettingPage
      community={route?.params?.community}
    />
  );
}

export default CommunityStoriesNotificationSetting;
