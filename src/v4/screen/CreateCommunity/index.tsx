import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunitySetupPage, {
  AmityCommunitySetupPageMode,
} from '../../PublicApi/Pages/AmityCommunitySetupPage';
import { RootStackParamList } from '../../routes/RouteParamList';

type CreateCommunityProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateCommunity'
>;

function CreateCommunity(_: CreateCommunityProps) {
  return <AmityCommunitySetupPage mode={AmityCommunitySetupPageMode.CREATE} />;
}

export default CreateCommunity;
