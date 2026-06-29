import { PermissionsAndroid, Platform } from 'react-native';

export const useCameraPermission = () => {
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Already granted (e.g. a previous session) — don't re-prompt, which on
        // some devices/host setups resolves to a non-GRANTED result and makes
        // the camera flow appear denied. Check first, then request only if
        // needed.
        const alreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (alreadyGranted) return true;

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        // If the request path throws (host-specific permission setups), fall
        // back to a plain check rather than hard-failing the camera flow.
        try {
          return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.CAMERA
          );
        } catch {
          return false;
        }
      }
    }
    return true; // iOS handles permissions automatically through Info.plist
  };

  const getCameraPermission = async () => {
    const permission = await requestCameraPermission();
    return permission;
  };

  return { getCameraPermission };
};
