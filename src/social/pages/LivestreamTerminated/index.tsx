import React from 'react';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityLivestreamTerminatedPage from '../../../v4/PublicApi/Pages/AmityLivestreamTerminatedPage';

type LivestreamTerminatedProps = NativeStackScreenProps<
  RootStackParamList,
  'LivestreamTerminated'
>;

function LivestreamTerminated(_: LivestreamTerminatedProps) {
  return <AmityLivestreamTerminatedPage />;
}

export default LivestreamTerminated;
