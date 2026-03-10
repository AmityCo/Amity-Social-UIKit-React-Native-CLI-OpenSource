import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityLiveStreamPlayerPage from '../../features/livestream/Player';

type LivestreamPlayerProps = NativeStackScreenProps<
  RootStackParamList,
  'LivestreamPlayer'
>;

function LivestreamPlayer(_: LivestreamPlayerProps) {
  return <AmityLiveStreamPlayerPage />;
}

export default LivestreamPlayer;
