// MessageFullTextScreen — ported from AmityUiKitWeb features/shared/components/
// MessageFullTextScreen. The full-screen "see more" long-text view. Web renders a
// fixed overlay dialog + `linkify-react`; RN uses a full-screen Modal (Android
// back button === web Escape via onRequestClose) and a small local linkifier that
// renders URL runs as tappable Text opening the system browser. Header carries a
// ghost back button, a centered title, and a balancing spacer.

// 1. React / RN imports
import { Fragment } from 'react';
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useStyles } from './styles';

// 3. Types
type MessageFullTextScreenProps = {
  visible: boolean;
  text: string;
  title?: string;
  onClose: () => void;
};

// Matches http(s) URLs and bare www.* runs; kept local so the component is
// self-contained (no dependency on the legacy PreviewLink util module). The split
// regex is global (capturing) so URL runs survive `String.split`; a separate
// non-global regex is used for per-part testing to avoid stateful `lastIndex`.
const URL_SPLIT_REGEX = /((?:https?:\/\/|www\.)[^\s]+)/gi;
const URL_TEST_REGEX = /^(?:https?:\/\/|www\.)[^\s]+$/i;

function openLink(raw: string) {
  const href = raw.startsWith('http') ? raw : `https://${raw}`;
  Linking.openURL(href).catch(() => undefined);
}

// 4. Named function component
export function MessageFullTextScreen({
  visible,
  text,
  title,
  onClose,
}: MessageFullTextScreenProps) {
  const { styles } = useStyles();

  const parts = text.split(URL_SPLIT_REGEX);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <AmityIcon
              name="chevron-left"
              size={24}
              tokenColor={AmityColorToken.IconIconButtonGhostSecondaryDefault}
            />
          </Pressable>
          <Typography
            variant="titleBold"
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </Typography>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView style={styles.body}>
          <Typography variant="body" style={styles.text} selectable>
            {parts.map((part, index) =>
              URL_TEST_REGEX.test(part) ? (
                <Typography
                  key={`${part}-${index}`}
                  variant="body"
                  style={[styles.text, styles.link]}
                  onPress={() => openLink(part)}
                >
                  {part}
                </Typography>
              ) : (
                <Fragment key={`t-${index}`}>{part}</Fragment>
              )
            )}
          </Typography>
        </ScrollView>
      </View>
    </Modal>
  );
}
