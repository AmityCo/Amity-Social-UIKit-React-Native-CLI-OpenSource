import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  AmityUiKitProvider,
  AmityUiKitSocial,
} from '@amityco/react-native-social-uikit';
import { Client, FileRepository } from '@amityco/ts-sdk-react-native';
import DocumentPicker from 'react-native-document-picker';
import messaging from '@react-native-firebase/messaging';
import config from '../uikit.config.json';

const API_KEY = 'b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f';
const API_REGION = 'sg';
const API_ENDPOINT = 'https://api.sg.amity.co';
const SDK_USER_ID = 'sdkSandboxUser';
const SDK_DISPLAY_NAME = 'SDK Sandbox User';

const Tab = createBottomTabNavigator();

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background notification:', remoteMessage);
});

// ==================== UIKit Tab ====================
function UIKitScreen({ fcmToken }: { fcmToken: string | null }) {
  if (!fcmToken) return null;

  return (
    <AmityUiKitProvider
      configs={config}
      apiKey={API_KEY}
      apiRegion={API_REGION}
      userId="topAmity"
      displayName="topAmity"
      apiEndpoint={API_ENDPOINT}
      fcmToken={fcmToken}
    >
      <AmityUiKitSocial />
    </AmityUiKitProvider>
  );
}

// ==================== SDK Sandbox Tab ====================
function SdkScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [sessionState, setSessionState] = useState<string>('');

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      Client.createClient(API_KEY, API_REGION, {
        apiEndpoint: { http: API_ENDPOINT },
        prefixDeviceIdKey: 'ts-sdk',
      });

      Client.onSessionStateChange((state: Amity.SessionStates) => {
        console.log('Session state changed:', state);
        setSessionState(state);
        if (state === 'established') {
          setIsLoggedIn(true);
        }
      });

      const sessionHandler: Amity.SessionHandler = {
        sessionWillRenewAccessToken(renewal) {
          renewal.renew();
        },
      };

      const response = await Client.login(
        {
          userId: SDK_USER_ID,
          displayName: SDK_DISPLAY_NAME,
        },
        sessionHandler
      );

      console.log('Login response:', response);
      Alert.alert('Success', `Logged in as ${SDK_USER_ID}`);
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', error?.message || 'Unknown error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUploadAudio = async () => {
    if (!isLoggedIn) {
      Alert.alert('Not Logged In', 'Please login first before uploading.');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio],
      });

      console.log('Selected file:', result);

      const formData = new FormData();
      formData.append('file', {
        uri: result.uri,
        name: `voice-${Date.now()}.m4a`,
        type: 'audio/m4a',
      } as any);

      const response = await FileRepository.uploadAudio(
        formData,
        (progress) => {
          console.log('Upload progress:', Math.round(progress * 100), '%');
        }
      );

      console.log('Upload response:', response);
      setUploadResult(response);
      Alert.alert('Upload Success', 'Audio file uploaded successfully!');
    } catch (error: any) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled file picker');
        setIsUploading(false);
        return;
      }
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error?.message || 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView
      style={sdkStyles.container}
      contentContainerStyle={sdkStyles.content}
    >
      <Text style={sdkStyles.title}>SDK Sandbox</Text>
      <Text style={sdkStyles.subtitle}>Test Amity SDK features directly</Text>

      <View style={sdkStyles.statusCard}>
        <Text style={sdkStyles.statusLabel}>Connection Status:</Text>
        <Text
          style={[
            sdkStyles.statusValue,
            { color: isLoggedIn ? '#4CAF50' : '#F44336' },
          ]}
        >
          {isLoggedIn ? '● Connected' : '○ Disconnected'}
        </Text>
        {sessionState ? (
          <Text style={sdkStyles.sessionInfo}>
            Session: {sessionState} | User: {SDK_USER_ID}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[sdkStyles.button, sdkStyles.loginButton]}
        onPress={handleLogin}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={sdkStyles.buttonText}>
            {isLoggedIn ? 'Re-Login' : 'Login to Amity SDK'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          sdkStyles.button,
          sdkStyles.uploadButton,
          !isLoggedIn && sdkStyles.disabledButton,
        ]}
        onPress={handleUploadAudio}
        disabled={isUploading || !isLoggedIn}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={sdkStyles.buttonText}>Upload Audio File</Text>
        )}
      </TouchableOpacity>

      {uploadResult && (
        <View style={sdkStyles.resultCard}>
          <Text style={sdkStyles.resultTitle}>Upload Result:</Text>
          <Text style={sdkStyles.resultText}>
            {JSON.stringify(uploadResult, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ==================== Main App ====================
export default function App() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
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
            PermissionsAndroid.request(
              'android.permission.POST_NOTIFICATIONS' as any
            )
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
          setFcmToken(token ?? null);
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

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1976D2',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#eee',
          },
        }}
      >
        <Tab.Screen
          name="UIKit"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>💬</Text>
            ),
          }}
        >
          {() => <UIKitScreen fcmToken={fcmToken} />}
        </Tab.Screen>
        <Tab.Screen
          name="SDK"
          component={SdkScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>🧪</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ==================== SDK Styles ====================
const sdkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  sessionInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#1976D2',
  },
  uploadButton: {
    backgroundColor: '#FF9800',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});
