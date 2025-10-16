import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityCommentsNotificationSettingPage from '~/v4/PublicApi/Pages/AmityCommunityCommentsNotificationSettingPage';

type CommunityCommentsNotificationSettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityCommentsNotificationSetting'
>;

function CommunityCommentsNotificationSetting(
  _: CommunityCommentsNotificationSettingProps
) {
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'CommunityCommentsNotificationSetting'>
    >();

  return (
    <AmityCommunityCommentsNotificationSettingPage
      community={route?.params?.community}
    />
  );
}

export default CommunityCommentsNotificationSetting;
