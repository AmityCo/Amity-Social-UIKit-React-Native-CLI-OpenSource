import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCreateLivestreamPage from '../../features/livestream/Create';
import { RootStackParamList } from '../../../core/routes/RouteParamList';

type CreateLivestreamProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateLivestream'
>;

function CreateLivestream({}: CreateLivestreamProps) {
  return <AmityCreateLivestreamPage />;
}

export default CreateLivestream;
