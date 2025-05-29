import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityLivestreamPostTargetSelectionPage from '../../PublicApi/Pages/AmityLivestreamPostTargetSelectionPage';
import { RootStackParamList } from '../../routes/RouteParamList';

type LivestreamPostTargetSelectionProps = NativeStackScreenProps<
  RootStackParamList,
  'LivestreamPostTargetSelection'
>;

function LivestreamPostTargetSelection({}: LivestreamPostTargetSelectionProps) {
  return <AmityLivestreamPostTargetSelectionPage />;
}

export default LivestreamPostTargetSelection;
