import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunitySetupPage, {
  AmityCommunitySetupPageMode,
} from '../../../v4/PublicApi/Pages/AmityCommunitySetupPage';
import { RootStackParamList } from '../../../core/routes/RouteParamList';

type CreateCommunityProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateCommunity'
>;

function CreateCommunity(_: CreateCommunityProps) {
  return <AmityCommunitySetupPage mode={AmityCommunitySetupPageMode.CREATE} />;
}

export default CreateCommunity;
