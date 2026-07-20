// ImageViewer — ported from AmityUiKitWeb chat/features/shared/components/ImageViewer.
// Web wrapped MediaViewer around an <img>; RN uses react-native-image-viewing, which
// provides its own pan/zoom full-screen viewer. We layer the same chrome via its
// HeaderComponent (close) and FooterComponent (delete/save) props so the surface
// matches VideoPlayer/MediaViewer.

// 1. React / RN imports
import { Pressable, View } from 'react-native';

// 2. Third-party imports
import ImageView from 'react-native-image-viewing';

// 3. Internal imports
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { useString } from '../../../../../../../core/localization';
import { useStyles } from './styles';

// 4. Types
type ImageViewerProps = {
  src: string;
  onClose: () => void;
  isOwn?: boolean;
  onDelete?: () => void;
  onSave?: () => void;
};

// 5. Named function component
export function ImageViewer({
  src,
  onClose,
  isOwn = false,
  onDelete,
  onSave,
}: ImageViewerProps) {
  const { styles } = useStyles();
  const token = useToken();
  const deleteLabel = useString('amity_chat_option_delete');
  const saveLabel = useString('amity_chat_action_save');

  const canDelete = isOwn && !!onDelete;
  const canSave = !!onSave;

  return (
    <ImageView
      images={[{ uri: src }]}
      imageIndex={0}
      visible
      onRequestClose={onClose}
      backgroundColor={token(
        AmityColorToken.SurfaceBadgeSemanticBadgeGeneralDuration
      )}
      HeaderComponent={() => (
        <View style={styles.topBar}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <AmityIcon
              name="cross-r"
              size={24}
              tokenColor={
                AmityColorToken.IconIconButtonTransparentPrimaryDefault
              }
            />
          </Pressable>
        </View>
      )}
      FooterComponent={
        canDelete || canSave
          ? () => (
              <View style={styles.bottomBar}>
                {canDelete ? (
                  <Pressable
                    style={styles.bottomIconButton}
                    onPress={onDelete}
                    accessibilityRole="button"
                    accessibilityLabel={deleteLabel}
                  >
                    <AmityIcon
                      name="trash-r"
                      size={24}
                      tokenColor={
                        AmityColorToken.IconIconButtonTransparentPrimaryDefault
                      }
                    />
                  </Pressable>
                ) : (
                  <View />
                )}

                {canSave ? (
                  <Pressable
                    style={styles.bottomIconButton}
                    onPress={onSave}
                    accessibilityRole="button"
                    accessibilityLabel={saveLabel}
                  >
                    <AmityIcon
                      name="arrow-down-to-bracket-r"
                      size={24}
                      tokenColor={
                        AmityColorToken.IconIconButtonTransparentPrimaryDefault
                      }
                    />
                  </Pressable>
                ) : (
                  <View />
                )}
              </View>
            )
          : undefined
      }
    />
  );
}
