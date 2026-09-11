// MediaViewer — ported from AmityUiKitWeb chat/features/shared/components/MediaViewer.
// Full-screen media shell: a dark backdrop, a top bar with a close button, a centered
// stage for arbitrary media (children), and a bottom bar with optional delete (own
// message only) + save actions. Web used react-aria ModalOverlay/Modal/Dialog; RN uses
// the native Modal. Used by VideoPlayer; images use react-native-image-viewing instead.

// 1. React / RN imports
import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';

// 2. Third-party imports
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 3. Internal imports
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import Toast from '../../../../../social/components/Toast';
import { useStyles } from './styles';

// 4. Types
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

// 5. Named function component
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
      {/* The bars are pinned to the screen edges, so they take the safe-area
          insets through a SafeAreaView — without the top inset the close button
          sits under the status bar, and behind the Dynamic Island on the devices
          that have one, which does not pass touches through: the button cannot
          be tapped and the viewer cannot be closed. The provider has to be
          mounted here, inside the Modal: the one the UIKit mounts at its root
          sits wherever the host app placed it (in the sample app that is below
          the status bar, so its top inset reads zero), and a Modal's content is
          a separate native hierarchy anyway. */}
      <SafeAreaProvider>
        <View
          style={styles.overlay}
          accessibilityLabel={accessibilityLabel}
          accessibilityViewIsModal
        >
          <View style={styles.stage}>{children}</View>

          <SafeAreaView edges={['top', 'left', 'right']} style={styles.topBar}>
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
          </SafeAreaView>

          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            style={styles.bottomBar}
          >
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
          </SafeAreaView>

          {/* Save success/failure toasts fire while this Modal is open. The global
              <Toast /> is mounted outside it, so RN would render it beneath the
              native Modal layer; mount one inside too — it reads the same redux
              toast state, so only one pill is ever visible. */}
          <View pointerEvents="box-none" style={styles.toastLayer}>
            <Toast />
          </View>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}
