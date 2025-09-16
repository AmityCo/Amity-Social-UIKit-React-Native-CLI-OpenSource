import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityStorySettingPage from '~/v4/PublicApi/Pages/AmityCommunityStorySettingPage';

type CommunityStorySettingProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityStorySetting'
>;

function CommunityStorySetting(_: CommunityStorySettingProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityStorySetting'>>();

  return (
    <AmityCommunityStorySettingPage community={route?.params?.community} />
  );
}

export default CommunityStorySetting;
