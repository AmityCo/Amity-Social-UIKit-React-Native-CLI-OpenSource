import { useEffect } from 'react';
import { View } from 'react-native';
import { Track } from 'livekit-client';
import { VideoTrack, useLocalParticipant } from '@livekit/react-native';
import { useStyles } from './styles';

interface RoomViewProps {
  onLocalParticipantReady?: (participant: any) => void;
  isFrontCamera: boolean;
}

export const RoomView: React.FC<RoomViewProps> = ({
  onLocalParticipantReady,
  isFrontCamera,
}) => {
  const { localParticipant } = useLocalParticipant();
  const styles = useStyles();

  useEffect(() => {
    if (localParticipant && onLocalParticipantReady) {
      onLocalParticipantReady(localParticipant);
    }
  }, [localParticipant, onLocalParticipantReady]);

  if (!localParticipant?.isCameraEnabled) {
    return <View style={styles.roomContainer} />;
  }

  const cameraTrack = localParticipant.getTrackPublication(Track.Source.Camera);

  if (!cameraTrack?.track) {
    return <View style={styles.roomContainer} />;
  }

  return (
    <View style={styles.roomContainer}>
      <VideoTrack
        trackRef={{
          participant: localParticipant,
          publication: cameraTrack,
          source: Track.Source.Camera,
        }}
        style={styles.videoTrack}
        mirror={isFrontCamera}
      />
    </View>
  );
};
