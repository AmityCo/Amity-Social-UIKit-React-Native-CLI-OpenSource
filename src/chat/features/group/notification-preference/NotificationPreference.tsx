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
//   - iOS-ALIGNED DEVIATION FROM WEB: web hard-codes `showDisabledByModeratorBanner
//     = false` (the banner never renders on web), but iOS shows a moderator banner
//     whenever the channel is silenced (`notificationMode === silent`), and cleverden
//     REQ-004 mandates it. Since this feature is ported from iOS, the banner renders
//     on `isSilent` (the toggle is already read-only in that state).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Third-party imports
import { Controller } from 'react-hook-form';

// 3. Internal imports (relative)
import { TopBar } from '../../../elements/TopBar';
import { useString } from '../../../../core/localization';
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

  return (
    <View style={styles.container}>
      <TopBar title={pageTitle} leadingType="back" onLeading={handleClose} />
      {isSilent && <DisabledByModeratorBanner />}
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
