import React from 'react';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityPollPostComposerPage from '../../legacy/Pages/AmityPollPostComposerPage';

type PollPostComposerProps = NativeStackScreenProps<
  RootStackParamList,
  'PollPostComposer'
>;

function PollPostComposer(_: PollPostComposerProps) {
  return <AmityPollPostComposerPage />;
}

export default PollPostComposer;
