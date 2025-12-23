import * as React from 'react';
import {
  AmityGlobalFeedComponent,
  AmityGlobalStoryTabWrapper,
  AmityPageRenderer,
  AmityPostTargetSelectionPage,
  AmityPostTargetSelectionPageType,
  AmityStoryTabComponent,
  AmityStoryTabComponentEnum,
  AmityUiKitProvider,
} from '@amityco/react-native-social-uikit';
import config from '../uikit.config.json';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, View } from 'react-native';
import { Button } from 'react-native-paper';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background notification:', remoteMessage);
});

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
  const [showPostModal, setShowPostModal] = useState(false);

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
      behaviour={{
        AmityPostTargetSelectionPageBehavior: {
          onClickClose: () => setShowPostModal(false),
        },
        AmityPostComposerPageBehavior: {
          onPressPost: () => setShowPostModal(false),
        },
      }}
    >
      <AmityPageRenderer>
        <AmityGlobalFeedComponent
          GlobalFeedHeaderComponent={
            <View>
              <AmityGlobalStoryTabWrapper>
                <AmityStoryTabComponent
                  type={AmityStoryTabComponentEnum.globalFeed}
                />
              </AmityGlobalStoryTabWrapper>
              <View style={{ height: 200, backgroundColor: 'lightgray' }} />
            </View>
          }
          isShowStoryTab={false}
        />
      </AmityPageRenderer>

      {showPostModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 10,
          }}
        >
          <AmityPageRenderer>
            <AmityPostTargetSelectionPage
              postType={AmityPostTargetSelectionPageType.post}
            />
          </AmityPageRenderer>
        </View>
      )}
      {/* <AmityUiKitSocial/> */}
      <View style={{ height: 80, backgroundColor: 'lightgray' }}>
        <Button onPress={() => setShowPostModal(true)}>
          Open Post Target Selection
        </Button>
      </View>
    </AmityUiKitProvider>
  );
}
