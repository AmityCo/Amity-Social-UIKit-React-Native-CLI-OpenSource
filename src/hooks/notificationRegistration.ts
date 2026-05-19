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
