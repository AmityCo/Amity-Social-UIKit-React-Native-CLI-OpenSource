import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityPostsNotificationSettingPage from '~/v4/PublicApi/Pages/AmityCommunityPostsNotificationSettingPage';

type CommunityPostsNotificationSettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityPostsNotificationSetting'
>;

function CommunityPostsNotificationSetting(
  _: CommunityPostsNotificationSettingProps
) {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityPostsNotificationSetting'>
    >();

  return (
    <AmityCommunityPostsNotificationSettingPage
      community={route?.params?.community}
    />
  );
}

export default CommunityPostsNotificationSetting;
