import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityPendingRequestPage from '~/v4/PublicApi/Pages/AmityCommunityPendingRequestPage';

type CommunityPendingRequestProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityPendingRequest'
>;

function CommunityPendingRequest(_: CommunityPendingRequestProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityPendingRequest'>>();

  return (
    <AmityCommunityPendingRequestPage community={route?.params?.community} />
  );
}

export default CommunityPendingRequest;
