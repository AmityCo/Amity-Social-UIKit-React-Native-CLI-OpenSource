import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  AmityPageRenderer,
  AmityUiKitProvider,
  AmityUiKitSocial,
  CommunityProfilePage,
  PostDetail,
} from '@amityco/react-native-social-uikit';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import config from '../uikit.config.json';
import messaging from '@react-native-firebase/messaging';

export default function App() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [initialScreen, setInitialScreen] = useState<string>('Home');
  console.log('initialScreen: ', initialScreen);
  const [targetId, setTargetId] = useState<string | null>(null);

  useEffect(() => {
    // 🔥 Initialize OneSignal
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize('128d4bfb-a7d1-4863-9267-2d79a3b5c73a');
    OneSignal.Notifications.requestPermission(true);
    // 🔥 Fetch push token
    const fetchToken = async () => {
      const token = await OneSignal.User.pushSubscription.getTokenAsync();
      if (token) {
        setPushToken(token);
      }
    };
    fetchToken();
    OneSignal.User.pushSubscription.addEventListener('change', fetchToken);
  }, []);

  useEffect(() => {
    // When app is opened from background
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Opened from background:', remoteMessage);
      if (
        remoteMessage.data.eventName === 'comment.created' ||
        remoteMessage.data.eventName === 'post.reacted'
      ) {
        setTargetId(remoteMessage?.data?.postId as string);
        setInitialScreen('postScreen');
      }
      if (remoteMessage.data.eventName === 'post.created') {
        setTargetId(remoteMessage?.data?.communityId as string);
        setInitialScreen('CommunityScreen');
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Opened from quit:', remoteMessage);
          if (
            remoteMessage.data.eventName === 'comment.created' ||
            remoteMessage.data.eventName === 'post.reacted'
          ) {
            setTargetId(remoteMessage?.data?.postId as string);
            setInitialScreen('postScreen');
          }
          if (remoteMessage.data.eventName === 'post.created') {
            setTargetId(remoteMessage?.data?.communityId as string);
            setInitialScreen('CommunityScreen');
          }
        }
      });

    return unsubscribe;
  }, []);

  if (!pushToken) return null;

  return (
    <AmityUiKitProvider
      configs={config}
      apiKey="b0ebeb5939def76019308d4a530b12ddd558dde5bf346e2e"
      apiRegion="us"
      userId="topAmity"
      displayName="topAmity"
      apiEndpoint="https://api.us.amity.co"
      fcmToken={pushToken}
    >
      {initialScreen === 'Home' ? (
        <AmityUiKitSocial />
      ) : initialScreen === 'postScreen' ? (
        <AmityPageRenderer>
          <PostDetail defaultPostId={targetId} />
        </AmityPageRenderer>
      ) : initialScreen === 'CommunityScreen' ? (
        <AmityPageRenderer>
          <CommunityProfilePage defaultCommunityId={targetId} />
        </AmityPageRenderer>
      ) : null}
    </AmityUiKitProvider>
  );
}
