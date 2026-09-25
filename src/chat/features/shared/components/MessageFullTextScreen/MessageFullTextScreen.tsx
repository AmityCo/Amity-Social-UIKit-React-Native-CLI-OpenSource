// MessageFullTextScreen — the full-screen "see more" long-text view. A Modal, so
// the Android back button dismisses it through onRequestClose. URL runs render as
// tappable Text that opens the system browser; detection lives in
// utils/linkifyText. Header carries a ghost back button, a centered title, and a
// balancing spacer.

// 1. React / RN imports
import { Fragment } from 'react';
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { splitTextByLinks } from '../../../../utils/linkifyText';
import { useStyles } from './styles';

// 3. Types
type MessageFullTextScreenProps = {
  visible: boolean;
  text: string;
  title?: string;
  onClose: () => void;
};

function openLink(href: string) {
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

  const segments = splitTextByLinks(text);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      {/* A Modal renders in its own native hierarchy, so the hosting page's
          SafeAreaView never reaches it and it needs its own provider too — the
          root one measures the app window, not the modal's, and reads zero in
          here. Without this the header sits under the status bar. */}
      <SafeAreaProvider>
        <SafeAreaView
          edges={['top', 'left', 'right', 'bottom']}
          style={styles.screen}
        >
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
              {segments.map((segment, index) =>
                segment.kind === 'link' ? (
                  <Typography
                    key={`l-${index}`}
                    variant="body"
                    style={[styles.text, styles.link]}
                    onPress={() => openLink(segment.href)}
                  >
                    {segment.value}
                  </Typography>
                ) : (
                  <Fragment key={`t-${index}`}>{segment.value}</Fragment>
                )
              )}
            </Typography>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
