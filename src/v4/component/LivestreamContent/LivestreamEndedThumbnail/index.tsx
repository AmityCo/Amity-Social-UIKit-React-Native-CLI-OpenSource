import React from 'react';
import { View } from 'react-native';
import { useStyles } from './styles';
import { Typography } from '../../Typography/Typography';

const LiveStreamEndThumbnail = () => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Typography.TitleBold style={styles.title}>
        This live stream has ended.
      </Typography.TitleBold>
      <Typography.Body style={styles.description}>
        Playback will be available for you {'\n'} to watch shortly.
      </Typography.Body>
    </View>
  );
};

export default LiveStreamEndThumbnail;
