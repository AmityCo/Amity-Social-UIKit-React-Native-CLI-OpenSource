// NotificationPreference — RN port of AmityUiKitWeb
// v4/chat/features/group/notification-preference/NotificationPreference. A TopBar
// over a single "allow notifications" toggle row. When the channel is silenced by
// a moderator the toggle is shown read-only (reflecting the persisted value).
//
// RN adaptations from web:
//   - `<div>` → View.
//   - The web `Toggle` atom is skipped in RN (the parity map maps it to the native
//     `Switch`), so `AllowNotifications` renders an RN `Switch`; the Controller
//     wiring is preserved 1:1.
//   - `showDisabledByModeratorBanner` is kept as the web's hard-coded `false` (the
//     banner never renders today) so the guard matches web exactly.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Third-party imports
import { Controller } from 'react-hook-form';

// 3. Internal imports (relative)
import { TopBar } from '../../../elements/TopBar';
import { useString } from '../../../../../../core/localization';
import { AllowNotifications } from './components/AllowNotifications/AllowNotifications';
import { DisabledByModeratorBanner } from './components/DisabledByModeratorBanner/DisabledByModeratorBanner';
import {
  useNotificationPreference,
  type NotificationPreferenceProps,
} from './hooks/useNotificationPreference';
import { useStyles } from './styles';

// 4. Named function component
export function NotificationPreference({
  channelId,
}: NotificationPreferenceProps) {
  const { styles } = useStyles();
  const { control, handleClose, handleSave, isSilent, persistedIsEnabled } =
    useNotificationPreference({ channelId });
  const pageTitle = useString('amity_chat_group_notif_pref_navbar_title');
  const showDisabledByModeratorBanner = false;

  return (
    <View style={styles.container}>
      <TopBar title={pageTitle} leadingType="back" onLeading={handleClose} />
      {showDisabledByModeratorBanner && isSilent && (
        <DisabledByModeratorBanner />
      )}
      {isSilent ? (
        <AllowNotifications isSelected={persistedIsEnabled} isDisabled />
      ) : (
        <Controller
          control={control}
          name="isEnabled"
          render={({ field: { value, onChange } }) => (
            <AllowNotifications
              isSelected={value}
              onChange={(next) => {
                onChange(next);
                handleSave();
              }}
            />
          )}
        />
      )}
    </View>
  );
}
