import { useCallback } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';
import { unregisterPushNotification } from './notificationRegistration';

/**
 * Hook that provides logout functions.
 *
 * `Client.secureLogout()` internally handles unregistering push notifications.
 * Callers do not need to call `unregisterPushNotification` separately.
 *
 * @example
 * const { logout } = useAmityLogout();
 * await logout();
 */
export const useAmityLogout = () => {
  const logout = useCallback(async () => {
    try {
      Client.stopUnreadSync();
      await Client.secureLogout(); // internally calls unregisterPushNotification
    } catch (e) {
      console.warn('[AmityUIKit] Amity logout error:', e);
    }
  }, []);

  const logoutWithApi = useCallback(async () => {
    try {
      await unregisterPushNotification();
      Client.stopUnreadSync();
      const res = await Client.secureLogout();
      console.log('res: ', res);
      console.log('Amity logout (API unregister) successful');
    } catch (e) {
      console.log('Amity logout error:', e);
    }
  }, []);

  return { logout, logoutWithApi };
};

export default useAmityLogout;
