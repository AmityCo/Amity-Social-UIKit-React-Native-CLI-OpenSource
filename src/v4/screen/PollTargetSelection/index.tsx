import React from 'react';
import { RootStackParamList } from '../../routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityPollTargetSelectionPage from '../../PublicApi/Pages/AmityPollTargetSelectionPage';

type PollTargetSelectionProps = NativeStackScreenProps<
  RootStackParamList,
  'PollTargetSelection'
>;

function PollTargetSelection(_: PollTargetSelectionProps) {
  return <AmityPollTargetSelectionPage />;
}

export default PollTargetSelection;
