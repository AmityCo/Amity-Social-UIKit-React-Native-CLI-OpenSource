import { useCallback } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';
import { unregisterPushNotification } from './notificationRegistration';

/**
 * Hook that provides two logout functions:
 *
 * 1. `logout` — Uses custom DELETE /v1/notification API to unregister push, then secureLogout.
 * 2. `logoutWithApi` — Uses custom DELETE API to unregister push, then secureLogout.
 *
 * @example
 * const { logout, logoutWithApi } = useAmityLogout();
 * await logout();        // API-based unregister (safe no-op if not registered)
 * await logoutWithApi();  // API-based unregister
 */
export const useAmityLogout = () => {
  /**
   * Logout using custom DELETE /v1/notification API to unregister push,
   * then stop sync and secureLogout. stopUnreadSync and secureLogout always run.
   */
  const logout = useCallback(async () => {
    try {
      await unregisterPushNotification();
    } catch (e) {
      console.warn(
        '[AmityUIKit] Failed to unregister push notification on logout:',
        e
      );
    }
    Client.stopUnreadSync();
    await Client.secureLogout();
  }, []);

  /**
   * Logout using custom DELETE /v1/notification API to unregister push
   */
  const logoutWithApi = useCallback(async () => {
    try {
      await unregisterPushNotification();
      Client.stopUnreadSync();
      await Client.secureLogout();
    } catch (e) {
      console.warn('[AmityUIKit] Amity logout error:', e);
    }
  }, []);

  return { logout, logoutWithApi };
};

export default useAmityLogout;
