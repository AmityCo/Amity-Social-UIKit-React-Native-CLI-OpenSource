import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  AmityUiKitProvider,
  AmityUiKitSocial,
} from '@amityco/react-native-social-uikit';
import { OneSignal, LogLevel } from 'react-native-onesignal'; // Import OneSignal
import config from '../uikit.config.json';

export default function App() {
  const [pushToken, setPushToken] = useState(null);
  console.log('pushToken: ', pushToken);

  useEffect(() => {
    // 1. Initialize OneSignal
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize('128d4bfb-a7d1-4863-9267-2d79a3b5c73a'); // Replace with your App ID
    OneSignal.Notifications.requestPermission(true);
    // 2. Get Push Token
    const fetchToken = async () => {
      const token = await OneSignal.User.pushSubscription.getTokenAsync();
      if (token) {
        setPushToken(token);
      }
    };

    fetchToken();

    const listener = () => {
      fetchToken();
    };

    OneSignal.User.pushSubscription.addEventListener('change', listener);
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('OneSignal: notification clicked:', event);
    });

    return () => {
      OneSignal.User.pushSubscription.removeEventListener('change', listener);
    };
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
      <AmityUiKitSocial />
    </AmityUiKitProvider>
  );
}
