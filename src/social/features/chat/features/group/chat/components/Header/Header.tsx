// Header — group conversation top bar, ported from AmityUiKitWeb
// group/chat/components/Header. Back button + a tappable identity (group avatar +
// name) that opens group settings. Banned variant shows the banned label and is not
// tappable. Offline status is surfaced by the WaitingForNetwork banner in GroupChat.

import { Pressable, View } from 'react-native';

import useFile from '../../../../../../../../core/hooks/useFile';
import { Typography } from '../../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../../core/localization';
import { Avatar } from '../../../../../elements/Avatar';
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
  const avatarUrl = useFile({
    fileId:
      (channel as { avatarFileId?: string } | undefined)?.avatarFileId ?? '',
  });
  const bannedTitle = useString('amity_chat_error_banned_chat_navbar_title');
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
      <Typography variant="titleBold" style={styles.name} numberOfLines={1}>
        {title}
      </Typography>
    </View>
  );

  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <AmityIcon
          name="chevron-left"
          size={24}
          tokenColor={AmityColorToken.IconIconButtonGhostSecondaryDefault}
        />
      </Pressable>
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
