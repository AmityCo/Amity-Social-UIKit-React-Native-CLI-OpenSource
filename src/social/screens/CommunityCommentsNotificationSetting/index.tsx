import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CommentsNotificationSetting from '../../features/community/CommentsNotificationSetting';

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

  return <CommentsNotificationSetting community={route?.params?.community} />;
}

export default CommunityCommentsNotificationSetting;
