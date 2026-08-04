// Header — conversation thread top bar, ported from AmityUiKitWeb
// features/conversation/chat/components/Header. Back button + name, plus a
// "waiting for network" subtitle (spinner + caption) rendered under the name
// while the device is offline. Avatar and the conversation action menu layer on
// in later M2 tasks.

// 1. React / RN imports
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

// 2. Internal imports
import { Avatar } from '../../../../../core/design/atoms/Avatar';
import { Button } from '../../../../../core/design/atoms/Button';
import { Typography } from '../../../../../core/design/components/Typography';
import { Loader } from '../../../../../core/design/atoms/Loader';
import { useString } from '../../../../../core/localization';
import { useNetworkOnline } from '../../../../hooks';
import { useStyles } from './styles';

// 3. Types
type HeaderProps = {
  title: string;
  /** Receiver's avatar URL (1-1 conversation). Falls back to initials when absent. */
  avatarUrl?: string;
  onBack: () => void;
  /** Right-aligned slot (e.g. the conversation user-action menu). */
  trailing?: ReactNode;
};

// 4. Named function component
export function Header({ title, avatarUrl, onBack, trailing }: HeaderProps) {
  const { styles } = useStyles();
  const { online } = useNetworkOnline();
  const waitingForNetwork = useString('amity_chat_waiting_for_network');
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
        />
        <View style={styles.title}>
          <Text style={styles.name} numberOfLines={1}>
            {title}
          </Text>
          {!online ? (
            <View style={styles.subtitle}>
              <Loader.Spinner size="sm" />
              <Typography variant="caption" style={styles.subtitleText}>
                {waitingForNetwork}
              </Typography>
            </View>
          ) : null}
        </View>
      </View>
      {trailing}
    </View>
  );
}
