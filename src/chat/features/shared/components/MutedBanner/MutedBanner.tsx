// MutedBanner — ported from AmityUiKitWeb features/shared/components/MutedBanner.
// A full-width subdued banner explaining why the composer is unavailable
// (user muted / channel moderator-only / blocked). All three strings are
// resolved unconditionally (matches web) to respect rules-of-hooks.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type MutedBannerProps = {
  variant: 'user' | 'channel' | 'blocked';
};

// 4. Named function component
export function MutedBanner({ variant }: MutedBannerProps) {
  const { styles } = useStyles();
  const userMutedMessage = useString('amity_chat_user_is_muted');
  const channelMutedMessage = useString(
    'amity_chat_group_permission_only_moderators_banner'
  );
  const blockedMessage = useString('amity_chat_blocked_message');

  const message =
    variant === 'user'
      ? userMutedMessage
      : variant === 'channel'
      ? channelMutedMessage
      : blockedMessage;

  return (
    <View style={styles.banner} accessibilityRole="text">
      <Typography variant="caption" style={styles.text}>
        {message}
      </Typography>
    </View>
  );
}
