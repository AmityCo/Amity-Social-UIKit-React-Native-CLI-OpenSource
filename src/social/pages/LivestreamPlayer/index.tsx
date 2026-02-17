import React from 'react';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityLiveStreamPlayerPage from '../../legacy/Pages/AmityLivestreamPlayerPage';

type LivestreamPlayerProps = NativeStackScreenProps<
  RootStackParamList,
  'LivestreamPlayer'
>;

function LivestreamPlayer(_: LivestreamPlayerProps) {
  return <AmityLiveStreamPlayerPage />;
}

export default LivestreamPlayer;
