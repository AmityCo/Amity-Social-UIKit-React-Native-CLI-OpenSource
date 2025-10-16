import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityMembershipPage from '~/v4/PublicApi/Pages/AmityCommunityMembershipPage';

type CommunityMembershipProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityMembership'
>;

function CommunityMembership(_: CommunityMembershipProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityMembership'>>();

  return <AmityCommunityMembershipPage community={route?.params?.community} />;
}

export default CommunityMembership;
