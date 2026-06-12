import { PermissionsAndroid, Platform } from 'react-native';

export const useCameraPermission = () => {
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
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
        return false;
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
