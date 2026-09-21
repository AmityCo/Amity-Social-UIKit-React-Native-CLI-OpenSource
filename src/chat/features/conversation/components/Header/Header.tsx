// Header — conversation thread top bar, ported from AmityUiKitWeb
// features/conversation/chat/components/Header. Back button + name, plus a
// "waiting for network" subtitle (spinner + caption) rendered under the name
// while the device is offline. Avatar and the conversation action menu layer on
// in later M2 tasks.

// 1. React / RN imports
import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';

// 2. Internal imports
import { Avatar } from '../../../../../core/design/atoms/Avatar';
import { BrandBadge } from '../../../../../core/design/elements/BrandBadge';
import { Button } from '../../../../../core/design/atoms/Button';
import { Typography } from '../../../../../core/design/components/Typography';
import { Loader } from '../../../../../core/design/atoms/Loader';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import { useNetworkOnline } from '../../../../hooks';
import { useBehaviour } from '../../../../../social/providers/BehaviourProvider';
import { ImageViewer } from '../../../shared/components/ImageViewer';
import { useStyles } from './styles';

// 3. Types
type HeaderProps = {
  title: string;
  /** Receiver's avatar URL (1-1 conversation). Falls back to initials when absent. */
  avatarUrl?: string;
  /** Receiver's id, handed to the avatar-tap behaviour when a host app sets one. */
  userId?: string;
  /**
   * Show the brand badge beside the name. AHEAD OF WEB and of the design SoT:
   * neither puts a brand badge in the conversation header — asked for by QA.
   */
  isBrand?: boolean;
  onBack: () => void;
  /** Right-aligned slot (e.g. the conversation user-action menu). */
  trailing?: ReactNode;
};

// 4. Named function component
export function Header({
  title,
  avatarUrl,
  userId,
  isBrand,
  onBack,
  trailing,
}: HeaderProps) {
  const { styles } = useStyles();
  const { online } = useNetworkOnline();
  const waitingForNetwork = useString('amity_chat_waiting_for_network');
  // Tapping the avatar opens the receiver's picture full screen. The viewer
  // belongs here rather than to the page: the header is what owns the avatar
  // and its URL.
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const { AmityChatPageBehavior } = useBehaviour();

  // A host app that wants the tap for itself — to push its own profile screen —
  // takes it through the behaviour. The full-screen picture is what happens
  // when nobody has claimed it.
  const handleAvatarPress = () => {
    if (AmityChatPageBehavior?.onAvatarTap) {
      AmityChatPageBehavior.onAvatarTap({
        userId: userId ?? '',
        avatarUrl,
      });
      return;
    }
    if (avatarUrl) setIsViewerOpen(true);
  };
  // Web: initials = first char of the display name (fallback '?').
  const initials = title.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.header}>
      <Button.Icon
        icon="chevron-left"
        styleType="ghost"
        hierarchy="secondary"
        size={32}
        onPress={onBack}
        accessibilityLabel="Back"
      />
      <View style={styles.identity}>
        <Avatar
          variant={avatarUrl ? 'image' : 'text'}
          shape="rounded"
          size={40}
          imageUrl={avatarUrl}
          initials={initials}
          // Pressable whenever there is either a picture to open or a host
          // app waiting for the tap.
          onPress={
            avatarUrl || AmityChatPageBehavior?.onAvatarTap
              ? handleAvatarPress
              : undefined
          }
          accessibilityLabel="View profile picture"
        />
        <View style={styles.title}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {title}
            </Text>
            {isBrand ? <BrandBadge accessibilityLabel="Brand" /> : null}
          </View>
          {!online ? (
            <View style={styles.subtitle}>
              {/* Figma: neutral grey spinner matching the caption, not the primary tint. */}
              <Loader.Spinner
                size="sm"
                tokenColor={
                  AmityColorToken.TextListTextDescriptionDefaultDefault
                }
              />
              <Typography variant="caption" style={styles.subtitleText}>
                {waitingForNetwork}
              </Typography>
            </View>
          ) : null}
        </View>
      </View>
      {trailing}

      {isViewerOpen && avatarUrl ? (
        <ImageViewer src={avatarUrl} onClose={() => setIsViewerOpen(false)} />
      ) : null}
    </View>
  );
}
