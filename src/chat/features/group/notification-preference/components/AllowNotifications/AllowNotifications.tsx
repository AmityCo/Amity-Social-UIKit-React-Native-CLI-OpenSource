// AllowNotifications — RN port of AmityUiKitWeb
// v4/chat/features/group/notification-preference/components/AllowNotifications.
// A list row: title + description on the left, an on/off toggle on the right.
//
// RN adaptations from web:
//   - `<div>` → View; `data-disabled` styling → conditional `disabled` text styles.
//   - The web `Toggle` atom is skipped in RN (parity map → native `Switch`); the
//     Switch is tinted with the Surface/Toggle design tokens so the on/off/thumb
//     colours match the web toggle.

// 1. React / RN imports
import { Switch, View } from 'react-native';

// 2. Internal imports (relative)
import { Typography } from '../../../../../../core/design/components/Typography';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type AllowNotificationsProps = {
  isSelected: boolean;
  isDisabled?: boolean;
  onChange?: (value: boolean) => void;
};

// 4. Named function component
export function AllowNotifications({
  isSelected,
  isDisabled = false,
  onChange,
}: AllowNotificationsProps) {
  const { styles, token } = useStyles();
  const title = useString('amity_chat_group_notification_preference_title');
  const description = useString(
    'amity_chat_group_notification_preference_description'
  );

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Typography
          variant="bodyBold"
          style={isDisabled ? styles.titleDisabled : styles.title}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          style={isDisabled ? styles.descriptionDisabled : styles.description}
        >
          {description}
        </Typography>
      </View>
      <Switch
        value={isSelected}
        disabled={isDisabled}
        onValueChange={onChange}
        accessibilityLabel={title}
        thumbColor={token(
          isSelected
            ? AmityColorToken.SurfaceToggleThumbActiveEnabled
            : AmityColorToken.SurfaceToggleThumbInactiveEnabled
        )}
        ios_backgroundColor={token(
          AmityColorToken.SurfaceToggleBackgroundInactiveEnabled
        )}
        trackColor={{
          true: token(AmityColorToken.SurfaceToggleBackgroundActiveEnabled),
          false: token(AmityColorToken.SurfaceToggleBackgroundInactiveEnabled),
        }}
      />
    </View>
  );
}
