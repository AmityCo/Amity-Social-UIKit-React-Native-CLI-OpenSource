import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PostsNotificationSetting from '../../features/community/PostsNotificationSetting';

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

  return <PostsNotificationSetting community={route?.params?.community} />;
}

export default CommunityPostsNotificationSetting;
