// MediaViewer — ported from AmityUiKitWeb chat/features/shared/components/MediaViewer.
// Full-screen media shell: a dark backdrop, a top bar with a close button, a centered
// stage for arbitrary media (children), and a bottom bar with optional delete (own
// message only) + save actions. Web used react-aria ModalOverlay/Modal/Dialog; RN uses
// the native Modal. Used by VideoPlayer; images use react-native-image-viewing instead.

// 1. React / RN imports
import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';

// 2. Internal imports
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import Toast from '../../../../../../components/Toast';
import { useStyles } from './styles';

// 3. Types
type MediaViewerProps = {
  accessibilityLabel: string;
  onClose: () => void;
  children: ReactNode;
  isOwn?: boolean;
  onDelete?: () => void;
  deleteAccessibilityLabel?: string;
  onSave?: () => void;
  saveAccessibilityLabel?: string;
};

// 4. Named function component
export function MediaViewer({
  accessibilityLabel,
  onClose,
  children,
  isOwn = false,
  onDelete,
  deleteAccessibilityLabel,
  onSave,
  saveAccessibilityLabel,
}: MediaViewerProps) {
  const { styles } = useStyles();
  const deleteLabel = useString('amity_chat_option_delete');
  const saveLabel = useString('amity_chat_action_save');

  const canDelete = isOwn && !!onDelete;
  const canSave = !!onSave;

  return (
    <Modal
      visible
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={styles.overlay}
        accessibilityLabel={accessibilityLabel}
        accessibilityViewIsModal
      >
        <View style={styles.stage}>{children}</View>

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

        <View style={styles.bottomBar}>
          {canDelete ? (
            <Pressable
              style={styles.bottomIconButton}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={deleteAccessibilityLabel ?? deleteLabel}
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
              accessibilityLabel={saveAccessibilityLabel ?? saveLabel}
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

        {/* Save success/failure toasts fire while this Modal is open. The global
            <Toast /> is mounted outside it, so RN would render it beneath the
            native Modal layer; mount one inside too — it reads the same redux
            toast state, so only one pill is ever visible. */}
        <View pointerEvents="box-none" style={styles.toastLayer}>
          <Toast />
        </View>
      </View>
    </Modal>
  );
}
