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

/**
 * Calls DELETE /v1/notification to unregister push notifications.
 */
export const unregisterPushNotification = async (): Promise<void> => {
  if (!hasNotificationRegistration()) {
    return;
  }
  const { apiEndpoint, apiKey, userId, deviceId } = registrationInfo;
  const url = `${apiEndpoint}/v1/notification?userId=${encodeURIComponent(
    userId
  )}&deviceId=${encodeURIComponent(deviceId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-API-KEY': apiKey,
    },
  });
  if (!res.ok) {
    throw new Error(`Unregister push notification failed: ${res.status}`);
  }
  clearNotificationRegistration();
};
