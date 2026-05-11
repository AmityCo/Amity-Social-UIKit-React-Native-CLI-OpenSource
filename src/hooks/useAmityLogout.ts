import { useCallback } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';
import { unregisterPushNotification } from './notificationRegistration';

/**
 * Hook that provides two logout functions:
 *
 * 1. `logout` — Uses SDK's `Client.unregisterPushNotification()` then secureLogout.
 * 2. `logoutWithApi` — Uses custom DELETE API to unregister push, then secureLogout.
 *
 * @example
 * const { logout, logoutWithApi } = useAmityLogout();
 * await logout();        // SDK-based unregister
 * await logoutWithApi();  // API-based unregister
 */
export const useAmityLogout = () => {
    /**
     * Logout using SDK's built-in Client.unregisterPushNotification()
     */
    const logout = useCallback(async () => {
        try {
            Client.stopUnreadSync();
            Client.unregisterPushNotification();
            const res = await Client.secureLogout();
            console.log('res: ', res);
            console.log('Amity logout (SDK unregister) successful');
        } catch (e) {
            console.log('Amity logout error:', e);
        }
    }, []);

    /**
     * Logout using custom DELETE /v1/notification API to unregister push
     */
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
