import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCreateLivestreamPage from '../../PublicApi/Pages/AmityCreateLivestreamPage';
import { RootStackParamList } from '../../routes/RouteParamList';

type CreateLivestreamProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateLivestream'
>;

function CreateLivestream({}: CreateLivestreamProps) {
  return <AmityCreateLivestreamPage />;
}

export default CreateLivestream;
