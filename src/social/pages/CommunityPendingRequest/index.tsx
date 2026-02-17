import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityPendingRequestPage from '../../legacy/Pages/AmityCommunityPendingRequestPage';

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
