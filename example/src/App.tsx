import {
  AmityUiKitProvider,
  AmityUiKitSocial,
  navigate,
} from '@amityco/react-native-social-uikit';
import config from '../uikit.config.json';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import { LogBox } from 'react-native';

function handleNotificationNavigation(remoteMessage: {
  data?: Record<string, any>;
}) {
  const { data } = remoteMessage;
  if (!data) return;

  if (
    data.eventName === 'post.created' ||
    data.eventName === 'post.approved' ||
    data.eventName === 'post.need-reviewing'
  ) {
    navigate('CommunityProfilePage', { communityId: data.communityId });
  } else if (
    data.eventName === 'post.reacted' ||
    data.eventName === 'text-mention-post.created' ||
    data.eventName === 'text-mention-user-feed-post.created' ||
    data.eventName === 'comment.created' ||
    data.eventName === 'comment.replied' ||
    data.eventName === 'comment.reacted' ||
    data.eventName === 'text-mention-comment.created' ||
    data.eventName === 'text-mention-comment.replied' ||
    data.eventName === 'text-mention-user-feed-comment.created' ||
    data.eventName === 'text-mention-user-feed-comment.replied'
  ) {
    navigate('PostDetail', { postId: data.postId });
  } else if (
    data.eventName === 'follow.created' ||
    data.eventName === 'follow.accepted' ||
    data.eventName === 'follow.requested'
  ) {
    navigate('UserProfile', { userId: data.publicId });
  }
}

LogBox.ignoreAllLogs(true);

export default function App() {
  const [fcmToken, setFcmToken] = useState(null);
  const logger = false;
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
        handleNotificationNavigation(remoteMessage);
      });

      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            handleNotificationNavigation(remoteMessage);
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
      apiKey="YOUR_API_KEY" // Put your apiKey
      apiRegion="API_REGION" // Put your apiRegion
      userId="USER_ID" // Put your UserId
      displayName="DISPLAYNAME" // Put your displayName
      apiEndpoint="API_ENDPOINT" //"https://api.{apiRegion}.amity.co"
      fcmToken={fcmToken} // android:fcm iOS:APN
    >
      <AmityUiKitSocial />
      {logger && <NetworkLogger />}
    </AmityUiKitProvider>
  );
}
