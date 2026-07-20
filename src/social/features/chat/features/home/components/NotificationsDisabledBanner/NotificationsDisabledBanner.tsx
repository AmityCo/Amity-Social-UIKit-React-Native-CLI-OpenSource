// NotificationsDisabledBanner — ported from AmityUiKitWeb
// v4/chat/features/home/components/NotificationsDisabledBanner.
// A subdued status banner shown when chat push notifications are disabled.
// (On web this is currently gated off; ChatHome does not mount it for M1.)

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import { useStyles, ICON_SIZE } from './styles';

// 3. Named function component
export function NotificationsDisabledBanner() {
  const { styles, token } = useStyles();
  const text = useString('amity_chat_notifications_disabled');

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <AmityIcon
        name="bell-slash-r"
        size={ICON_SIZE}
        color={token(AmityColorToken.IconBannerGreyBGDescriptionGeneral)}
      />
      <Typography variant="caption" style={styles.text}>
        {text}
      </Typography>
    </View>
  );
}
