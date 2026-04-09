import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityLivestreamTerminatedPage from '../../features/livestream/Terminated';

type LivestreamTerminatedProps = NativeStackScreenProps<
  RootStackParamList,
  'LivestreamTerminated'
>;

function LivestreamTerminated(_: LivestreamTerminatedProps) {
  return <AmityLivestreamTerminatedPage />;
}

export default LivestreamTerminated;
