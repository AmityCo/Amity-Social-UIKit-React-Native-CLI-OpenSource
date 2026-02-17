import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityNotificationSettingPage from '../../legacy/Pages/AmityCommunityNotificationSettingPage';

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
