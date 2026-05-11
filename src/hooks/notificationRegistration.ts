/**
 * Module-level store to persist push notification registration info
 * so it can be used during logout to unregister.
 */
let registrationInfo: {
    apiEndpoint: string;
    apiKey: string;
    userId: string;
    deviceId: string;
} | null = null;

export const saveNotificationRegistration = (info: {
    apiEndpoint: string;
    apiKey: string;
    userId: string;
    deviceId: string;
}) => {
    registrationInfo = info;
    console.log('📌 Saved push notification registration:', JSON.stringify(info));
};

export const getNotificationRegistration = () => registrationInfo;

export const clearNotificationRegistration = () => {
    registrationInfo = null;
};

/**
 * Calls DELETE /v1/notification to unregister push notifications.
 */
export const unregisterPushNotification = async (): Promise<void> => {
    if (!registrationInfo) {
        console.log('⚠️ No push notification registration to unregister');
        return;
    }
    const { apiEndpoint, apiKey, userId, deviceId } = registrationInfo;
    console.log('userId: ', userId);
    console.log('deviceId: ', deviceId);
    const url = `${apiEndpoint}/v1/notification?userId=${encodeURIComponent(userId)}&deviceId=${encodeURIComponent(deviceId)}`;
    console.log('🔔 Unregistering push notification:', url);
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'X-API-KEY': apiKey,
            },
        });
        console.log('🔔 Unregister push notification response:', res);
        clearNotificationRegistration();
    } catch (err) {
        console.error('🔔 Failed to unregister push notification:', err);
    }
};
