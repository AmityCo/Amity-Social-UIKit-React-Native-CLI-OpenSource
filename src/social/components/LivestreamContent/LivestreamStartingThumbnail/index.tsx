import { View } from 'react-native';
import { useStyles } from './styles';
import { Typography } from '../../../../core/components/Typography/Typography';
import { CircularProgressIndicator } from '../../CircularProgressIndicator';

const LiveStreamStartingThumbnail = () => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <CircularProgressIndicator size={40} strokeWidth={3} />
      <Typography.Body style={styles.description}>
        Starting live stream
      </Typography.Body>
    </View>
  );
};

export default LiveStreamStartingThumbnail;
