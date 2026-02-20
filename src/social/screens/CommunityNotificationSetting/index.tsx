import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import NotificationSetting from '../../features/community/NotificationSetting';

type CommunityNotificationSettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityNotificationSetting'
>;

function CommunityNotificationSetting(_: CommunityNotificationSettingProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityNotificationSetting'>>();

  return <NotificationSetting community={route?.params?.community} />;
}

export default CommunityNotificationSetting;
