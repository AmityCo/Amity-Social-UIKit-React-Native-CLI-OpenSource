import React from 'react';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityPollTargetSelectionPage from '../../../v4/PublicApi/Pages/AmityPollTargetSelectionPage';

type PollTargetSelectionProps = NativeStackScreenProps<
  RootStackParamList,
  'PollTargetSelection'
>;

function PollTargetSelection(_: PollTargetSelectionProps) {
  return <AmityPollTargetSelectionPage />;
}

export default PollTargetSelection;
