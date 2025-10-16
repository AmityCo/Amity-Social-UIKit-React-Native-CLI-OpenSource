import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunitySettingPage from '~/v4/PublicApi/Pages/AmityCommunitySettingPage';

type CommunitySettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunitySetting'
>;

function CommunitySetting(_: CommunitySettingProps) {
  const route = useRoute<RouteProp<RootStackParamList, 'CommunitySetting'>>();

  return <AmityCommunitySettingPage community={route?.params?.community} />;
}

export default CommunitySetting;
