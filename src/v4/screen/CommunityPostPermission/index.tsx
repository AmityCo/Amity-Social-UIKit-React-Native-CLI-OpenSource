import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityPostPermissionPage from '~/v4/PublicApi/Pages/AmityCommunityPostPermissionPage';

type CommunityPostPermissionProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityPostPermission'
>;

function CommunityPostPermission(_: CommunityPostPermissionProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityPostPermission'>>();

  return (
    <AmityCommunityPostPermissionPage community={route?.params?.community} />
  );
}

export default CommunityPostPermission;
