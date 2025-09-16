import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityLivestreamsNotificationSettingPage from '~/v4/PublicApi/Pages/AmityCommunityLivestreamsNotificationSettingPage';

type CommunityLivestreamsNotificationSettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityLivestreamsNotificationSetting'
>;

function CommunityLivestreamsNotificationSetting(
  _: CommunityLivestreamsNotificationSettingProps
) {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityLivestreamsNotificationSetting'>
    >();

  return (
    <AmityCommunityLivestreamsNotificationSettingPage
      community={route?.params?.community}
    />
  );
}

export default CommunityLivestreamsNotificationSetting;
