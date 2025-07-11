import React from 'react';
import { RootStackParamList } from '../../routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityPollPostComposerPage from '../../PublicApi/Pages/AmityPollPostComposerPage';

type PollPostComposerProps = NativeStackScreenProps<
  RootStackParamList,
  'PollPostComposer'
>;

function PollPostComposer(_: PollPostComposerProps) {
  return <AmityPollPostComposerPage />;
}

export default PollPostComposer;
