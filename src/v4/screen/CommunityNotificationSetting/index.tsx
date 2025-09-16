import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityNotificationSettingPage from '~/v4/PublicApi/Pages/AmityCommunityNotificationSettingPage';

type CommunityNotificationSettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityNotificationSetting'
>;

function CommunityNotificationSetting(_: CommunityNotificationSettingProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityNotificationSetting'>>();

  return (
    <AmityCommunityNotificationSettingPage
      community={route?.params?.community}
    />
  );
}

export default CommunityNotificationSetting;
