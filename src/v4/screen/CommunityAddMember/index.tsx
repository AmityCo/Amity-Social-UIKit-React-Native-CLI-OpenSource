import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import AmityCommunityAddMemberPage from '~/v4/PublicApi/Pages/AmityCommunityAddMemberPage';

type CommunityAddMemberProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityAddMember'
>;

function CommunityAddMember(_: CommunityAddMemberProps) {
  return <AmityCommunityAddMemberPage />;
}

export default CommunityAddMember;
