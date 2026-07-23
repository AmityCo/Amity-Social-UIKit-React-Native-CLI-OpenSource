// VideoPlayer — ported from AmityUiKitWeb chat/features/shared/components/VideoPlayer.
// Resolves the message's video fileId to its raw playable URL, then plays it inside the
// shared MediaViewer shell (close / delete / save chrome). Web used an autoplaying
// <video controls>; RN uses react-native-video with native controls.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Third-party imports
import Video from 'react-native-video';

// 3. Internal imports
import { MediaViewer } from '../MediaViewer';
import { useVideoFileUrl } from '../../../../hooks/useVideoFileUrl';
import { useStyles } from './styles';

// 4. Types
type VideoPlayerProps = {
  message: Amity.Message;
  onClose: () => void;
  isOwn?: boolean;
  onDelete?: () => void;
  onSave?: () => void;
};

// 5. Named function component
export function VideoPlayer({
  message,
  onClose,
  isOwn = false,
  onDelete,
  onSave,
}: VideoPlayerProps) {
  const { styles } = useStyles();
  const fileId = (message.data as { fileId?: string } | undefined)?.fileId;
  const src = useVideoFileUrl(fileId);

  return (
    <MediaViewer
      accessibilityLabel="Video player"
      onClose={onClose}
      isOwn={isOwn}
      onDelete={onDelete}
      onSave={onSave}
    >
      {src ? (
        <View style={styles.stage}>
          <Video
            source={{ uri: src }}
            controls
            paused={false}
            resizeMode="contain"
            playWhenInactive={false}
            playInBackground={false}
            style={styles.video}
          />
        </View>
      ) : null}
    </MediaViewer>
  );
}
