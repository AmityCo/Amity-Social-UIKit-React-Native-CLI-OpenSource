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
};

export const getNotificationRegistration = () => registrationInfo;

export const clearNotificationRegistration = () => {
  registrationInfo = null;
};

/**
 * Returns true only when all four registration fields are present and non-empty.
 */
export const hasNotificationRegistration = (): boolean => {
  return (
    registrationInfo !== null &&
    registrationInfo.apiEndpoint !== '' &&
    registrationInfo.apiKey !== '' &&
    registrationInfo.userId !== '' &&
    registrationInfo.deviceId !== ''
  );
};

export const unregisterPushNotification = async (): Promise<void> => {
  if (!registrationInfo) {
    console.log('⚠️ No push notification registration to unregister');
    return;
  }
  const { apiEndpoint, apiKey, userId, deviceId } = registrationInfo;
  console.log('userId: ', userId);
  console.log('deviceId: ', deviceId);
  const url = `${apiEndpoint}/v1/notification?userId=${encodeURIComponent(
    userId
  )}&deviceId=${encodeURIComponent(deviceId)}`;
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
