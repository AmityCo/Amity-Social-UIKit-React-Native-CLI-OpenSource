// Header — group conversation top bar, ported from AmityUiKitWeb
// group/chat/components/Header. Back button + a tappable identity (group avatar +
// name) that opens group settings. Banned variant shows the banned label and is not
// tappable. While the device is offline, the default (non-banned) identity shows a
// "waiting for network" subtitle (spinner + caption) under the name.

import { Pressable, View } from 'react-native';

import useFile from '../../../../../../core/hooks/useFile';
import { Button } from '../../../../../../core/design/atoms/Button';
import { Typography } from '../../../../../../core/design/components/Typography';
import { Loader } from '../../../../../../core/design/atoms/Loader';
import { useString } from '../../../../../../core/localization';
import { Avatar } from '../../../../../elements/Avatar';
import { useNetworkOnline } from '../../../../../hooks';
import { useStyles } from './styles';

type HeaderProps = {
  channel?: Amity.Channel;
  channelDisplayName?: string;
  variant?: 'default' | 'banned';
  onBack: () => void;
  onOpenSettings: () => void;
};

export function Header({
  channel,
  channelDisplayName,
  variant = 'default',
  onBack,
  onOpenSettings,
}: HeaderProps) {
  const { styles } = useStyles();
  const { online } = useNetworkOnline();
  const avatarUrl = useFile({
    fileId:
      (channel as { avatarFileId?: string } | undefined)?.avatarFileId ?? '',
  });
  const bannedTitle = useString('amity_chat_error_banned_chat_navbar_title');
  const waitingForNetwork = useString('amity_chat_waiting_for_network');
  const isBanned = variant === 'banned';
  const title = isBanned ? bannedTitle : channelDisplayName ?? '';

  const identity = (
    <View style={styles.identity}>
      <View style={styles.avatar}>
        <Avatar.GroupChat
          avatarUrl={avatarUrl}
          variant={isBanned ? 'banned' : 'default'}
        />
      </View>
      <View style={styles.title}>
        <Typography variant="titleBold" style={styles.name} numberOfLines={1}>
          {title}
        </Typography>
        {!isBanned && !online ? (
          <View style={styles.subtitle}>
            <Loader.Spinner size="sm" />
            <Typography variant="caption" style={styles.subtitleText}>
              {waitingForNetwork}
            </Typography>
          </View>
        ) : null}
      </View>
    </View>
  );

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
      {isBanned ? (
        identity
      ) : (
        <Pressable
          style={styles.identityButton}
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Open group settings"
        >
          {identity}
        </Pressable>
      )}
    </View>
  );
}
