import { RouteProp, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import Video from 'react-native-video';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { useStyles } from './styles';

export function VideoPlayerScreen() {
  const routes = useRoute<RouteProp<RootStackParamList, 'VideoPlayer'>>();
  const { styles } = useStyles();

  const { source } = routes.params;

  return (
    <View style={styles.container}>
      <Video
        controls
        style={styles.video}
        source={{ uri: source }}
        resizeMode="contain"
        playWhenInactive={false}
        playInBackground={false}
      />
    </View>
  );
}
