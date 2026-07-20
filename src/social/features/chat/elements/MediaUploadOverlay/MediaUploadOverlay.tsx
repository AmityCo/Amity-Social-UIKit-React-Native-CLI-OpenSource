// MediaUploadOverlay — ported from AmityUiKitWeb chat/elements/MediaUploadOverlay.
// A dark scrim covering a media bubble while its file uploads, with a centered upload
// spinner (Loader.Upload) that optionally exposes a cancel control. Web set the scrim
// pointer-events: none; RN uses pointerEvents="box-none" so the cancel button stays
// tappable while taps on the scrim itself fall through to the bubble.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Loader } from '../../../../../core/design/atoms/Loader';
import { useStyles } from './styles';

// 3. Types
export type MediaUploadOverlayProps = {
  onCancel?: () => void;
  cancelAccessibilityLabel?: string;
};

// 4. Named function component
export function MediaUploadOverlay({
  onCancel,
  cancelAccessibilityLabel = 'Cancel upload',
}: MediaUploadOverlayProps) {
  const { styles } = useStyles();

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Loader.Upload
        size="medium"
        onCancel={onCancel}
        accessibilityLabel={cancelAccessibilityLabel}
      />
    </View>
  );
}
