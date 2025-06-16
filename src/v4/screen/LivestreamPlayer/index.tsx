import React from 'react';
import { RootStackParamList } from '../../routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AmityLiveStreamPlayerPage } from '../../PublicApi/Pages/AmityLivestreamPlayerPage';

type LivestreamPlayerProps = NativeStackScreenProps<
  RootStackParamList,
  'LivestreamPlayer'
>;

function LivestreamPlayer(_: LivestreamPlayerProps) {
  return <AmityLiveStreamPlayerPage />;
}

export default LivestreamPlayer;
