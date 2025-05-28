import * as React from 'react';
import {
  AmityUiKitProvider,
  AmityUiKitSocial,
  AmityPageRenderer,
  AmityExploreComponent,
  PostDetail,

} from 'amity-react-native-social-ui-kit';
import config from '../uikit.config.json';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';


export default function App() {
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  useEffect(() => {
    let granted: boolean;
    messaging()
      .hasPermission()
      .then((enabled) => {
        granted =
          enabled === messaging.AuthorizationStatus.AUTHORIZED ||
          enabled === messaging.AuthorizationStatus.PROVISIONAL;
        if (!granted) {
          if (Platform.OS === 'android' && Platform.Version > 33) {
            PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS')
              .then((result) => {
                granted = result === PermissionsAndroid.RESULTS.GRANTED;
              })
              .finally(() => {
                setPermissionGranted(granted);
              });
          } else {
            messaging()
              .requestPermission()
              .then((result) => {
                granted =
                  result === messaging.AuthorizationStatus.AUTHORIZED ||
                  result === messaging.AuthorizationStatus.PROVISIONAL;
              })
              .finally(() => {
                setPermissionGranted(granted);
              });
          }
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setPermissionGranted(granted);
      });
    return () => {
      messaging().onTokenRefresh((token) => setFcmToken(token));
    };
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    if (permissionGranted) {
      messaging()
        .registerDeviceForRemoteMessages()
        .then(() =>
          Platform.select({
            ios: messaging().getAPNSToken(),
            android: messaging().getToken(),
          })
        )
        .then(async (token) => {
          setFcmToken(token);
        })
        .catch((error) => {
          console.log(error);
        });

      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification
        );
      });

      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage.notification
            );
          }
        });
      unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log(remoteMessage);
      });
    }

    return () => unsubscribe?.();
  }, [permissionGranted]);

  if (!fcmToken) return null;
  return (
    <AmityUiKitProvider
      configs={config} //put your config json object
      apiKey="b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f"
      apiRegion="sg"
      userId="topAmity"
      displayName="topAmity"
      apiEndpoint="https://api.sg.amity.co"
      fcmToken={fcmToken} // android:fcm iOS:APN
    >
      {/* <AmityUiKitSocial /> */}
      <AmityPageRenderer>
        <PostDetail defaultPostId='682b29cc5277f367939226bc'/>
      </AmityPageRenderer>
    </AmityUiKitProvider>
  );
}
