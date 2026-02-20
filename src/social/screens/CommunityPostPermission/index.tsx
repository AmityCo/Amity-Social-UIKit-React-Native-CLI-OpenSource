import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PostPermission from '../../features/community/PostPermission';

type CommunityPostPermissionProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityPostPermission'
>;

function CommunityPostPermission(_: CommunityPostPermissionProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityPostPermission'>>();

  return <PostPermission community={route?.params?.community} />;
}

export default CommunityPostPermission;
