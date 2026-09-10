// usePushNotificationEnabled — ported from AmityUIKitIOS AmityChatHomeViewModel
// (release/4.25.0, fetchPushNotificationSettings). The chat-home banner "Push
// notifications have been disabled by admin" shows when push is disabled at the
// network/admin level OR the chat module's push is disabled. Fetches the
// user-level notification settings once and computes
// `settings.isEnabled && chatModule.isEnabled`. Defaults to enabled (no banner)
// before the fetch resolves and on error, exactly like iOS.

import { useEffect, useState } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';

export function usePushNotificationEnabled(): boolean {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const settings = await Client.notifications().user().getSettings();
        const chatModule = settings.modules.find(
          (m) => m.moduleName === ('chat' as Amity.UserNotificationModuleName)
        );
        const chatModuleEnabled = chatModule?.isEnabled ?? true;
        if (active) setEnabled(settings.isEnabled && chatModuleEnabled);
      } catch {
        if (active) setEnabled(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return enabled;
}
