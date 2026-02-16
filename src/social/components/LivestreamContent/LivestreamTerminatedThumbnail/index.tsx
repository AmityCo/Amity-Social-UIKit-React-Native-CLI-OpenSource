import React from 'react';
import { View } from 'react-native';
import { useStyles } from './styles';
import { Typography } from '../../Typography/Typography';

const LiveStreamTerminatedThumbnail = () => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Typography.TitleBold style={styles.title}>
        The stream has been terminated.
      </Typography.TitleBold>
      <Typography.Body style={styles.description}>
        It looks like this live stream goes against {'\n'} our content
        moderation guidelines.
      </Typography.Body>
    </View>
  );
};

export default LiveStreamTerminatedThumbnail;
