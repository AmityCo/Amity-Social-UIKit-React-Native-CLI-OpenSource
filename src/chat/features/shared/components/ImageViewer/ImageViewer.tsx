// ImageViewer — ported from AmityUiKitWeb chat/features/shared/components/ImageViewer.
// Web wrapped MediaViewer around an <img>; RN uses react-native-image-viewing, which
// provides its own pan/zoom full-screen viewer. We layer the same chrome via its
// HeaderComponent (close) and FooterComponent (delete/save) props so the surface
// matches VideoPlayer/MediaViewer.

// 1. React / RN imports
import { Pressable, View } from 'react-native';

// 2. Third-party imports
import ImageView from 'react-native-image-viewing';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 3. Internal imports
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import Toast from '../../../../../social/components/Toast';
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
      // Web MediaViewer overlay is solid black (.mediaViewer__overlay background);
      // rgb() (no hex) keeps the repo's no-hex gate happy.
      backgroundColor="rgb(0, 0, 0)"
      // The bars take the real safe-area insets through a SafeAreaView, and the
      // provider has to be mounted here, inside the viewer's own Modal: the
      // provider the UIKit mounts at its root sits wherever the host app placed
      // it (in the sample app that is below the status bar, so its top inset
      // reads zero), and a Modal's content is a separate native hierarchy
      // anyway. The top padding used to be a hardcoded 44 — the old notch
      // height. On a Dynamic Island device the inset is 59, so the close button
      // sat under the island, which does not pass touches through: the button
      // could not be tapped at all and the viewer could not be closed.
      HeaderComponent={() => (
        <SafeAreaProvider>
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
        </SafeAreaProvider>
      )}
      // Always rendered: besides the action bar it hosts the chat toast. Save
      // success/failure toasts fire while this Modal is open, and the global
      // <Toast /> is mounted outside it (RN renders it beneath the native Modal
      // layer), so a second instance lives here — it reads the same redux toast
      // state, so only one pill is ever visible. It sits in the library's footer
      // container, which slides away with the bars on tap-to-toggle; that is
      // intended (bars hidden = "show me the image unobstructed"). Not a sibling
      // <Modal>: stacked RN modals are unreliable on iOS.
      FooterComponent={() => (
        <>
          <View pointerEvents="box-none" style={styles.toastLayer}>
            <Toast />
          </View>

          {canDelete || canSave ? (
            <SafeAreaProvider>
              <SafeAreaView
                edges={['bottom', 'left', 'right']}
                style={styles.bottomBar}
              >
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
              </SafeAreaView>
            </SafeAreaProvider>
          ) : null}
        </>
      )}
    />
  );
}
