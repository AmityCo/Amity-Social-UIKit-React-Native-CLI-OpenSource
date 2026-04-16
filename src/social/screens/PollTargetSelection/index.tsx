import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityPollTargetSelectionPage from '../../features/poll/TargetSelection';

type PollTargetSelectionProps = NativeStackScreenProps<
  RootStackParamList,
  'PollTargetSelection'
>;

function PollTargetSelection(_: PollTargetSelectionProps) {
  return <AmityPollTargetSelectionPage />;
}

export default PollTargetSelection;
