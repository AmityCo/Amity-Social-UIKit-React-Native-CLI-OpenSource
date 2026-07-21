// DisabledByModeratorBanner — RN port of AmityUiKitWeb
// v4/chat/features/group/notification-preference/components/DisabledByModeratorBanner.
// A centered subdued banner (bell-slash icon + caption) shown when notifications
// were silenced by a moderator.
//
// RN adaptations from web:
//   - `<div role="status">` → View with `accessibilityRole="alert"` (RN has no
//     "status" role; "alert" is the closest live-region role).
//   - Web `BellSlash` (its default = Regular variant) → the SoT `bell-slash-r`
//     icon (byte-identical to web's Regular path).
//   - Web's Subdue banner icon/text tokens are not yet in the RN SoT catalog; the
//     colour-identical GreyBG variants are used (documented in the fidelity
//     checker's allowlist).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Named function component
export function DisabledByModeratorBanner() {
  const { styles } = useStyles();
  const text = useString('amity_chat_group_notifications_disabled');

  return (
    <View style={styles.container} accessibilityRole="alert">
      <AmityIcon
        name="bell-slash-r"
        size={18}
        tokenColor={AmityColorToken.IconBannerGreyBGDescriptionGeneral}
      />
      <Typography variant="caption" style={styles.text}>
        {text}
      </Typography>
    </View>
  );
}
