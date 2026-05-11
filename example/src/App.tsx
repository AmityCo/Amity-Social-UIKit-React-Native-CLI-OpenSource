import * as React from 'react';
import {
  AmityUiKitProvider,
  AmityUiKitSocial,
  useAmityLogout,
} from '@amityco/react-native-social-uikit';
import config from '../uikit.config.json';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useEffect, useState, useCallback } from 'react';
import {
  PermissionsAndroid,
  Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import NetworkLogger from 'react-native-network-logger'

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('🔔 Background notification:', JSON.stringify(remoteMessage, null, 2));
});

export default function App() {
  const [fcmToken, setFcmToken] = useState(null);
  console.log('fcmToken: ', fcmToken);
  const { logout, logoutWithApi } = useAmityLogout();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notiPayload, setNotiPayload] = useState<string | null>(null);
  const [notiSource, setNotiSource] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ userId: string; displayName: string } | null>(null);
  const [loginSessionKey, setLoginSessionKey] = useState(0);
  const [showNetworkLogger, setShowNetworkLogger] = useState(false);

  // Login form state
  const [inputUserId, setInputUserId] = useState('topSocialPlus2');
  const [inputDisplayName, setInputDisplayName] = useState('topSocialPlus2');

  const showPayload = useCallback((source: string, message: any) => {
    const json = JSON.stringify(message, null, 2);
    console.log(`🔔 ${source}:`, json);
    setNotiSource(source);
    setNotiPayload(json);
    setModalVisible(true);
  }, []);

  const handleCopy = useCallback(() => {
    if (notiPayload) {
      Share.share({ message: notiPayload }).catch(() => { });
    }
  }, [notiPayload]);
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
    let unsubscribeFirebase: () => void;
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

      if (Platform.OS === 'ios') {
        // ===== iOS: Use PushNotificationIOS for APNs click detection =====

        // User tapped notification (app in foreground or background)
        PushNotificationIOS.addEventListener('notification', (notification) => {
          // Show the raw notification object as-is
          showPayload('iOS notification tapped', notification);
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        });

        // App launched by tapping notification (from killed state)
        PushNotificationIOS.getInitialNotification().then((notification) => {
          if (notification) {
            // Show the raw notification object as-is
            showPayload('iOS clicked (from quit state)', notification);
          }
        });

      } else {
        // ===== Android: Use Firebase Messaging for FCM click detection =====

        messaging().onNotificationOpenedApp((remoteMessage) => {
          showPayload('Android clicked (from background)', remoteMessage);
          // TODO: Add your custom navigation logic here
        });

        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            if (remoteMessage) {
              showPayload('Android clicked (from quit state)', remoteMessage);
              // TODO: Add your custom navigation logic here
            }
          });

        unsubscribeFirebase = messaging().onMessage(async (remoteMessage) => {
          showPayload('Android foreground notification', remoteMessage);
        });
      }
    }

    return () => {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.removeEventListener('notification');
      }
      unsubscribeFirebase?.();
    };
  }, [permissionGranted, showPayload]);

  if (!fcmToken) return null;

  // ===== Login Screen =====
  if (!loggedInUser) {
    return (
      <SafeAreaView style={loginStyles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <View style={loginStyles.card}>
            <Text style={loginStyles.title}>🔐 Amity UIKit</Text>
            <Text style={loginStyles.subtitle}>Enter credentials to continue</Text>

            <Text style={loginStyles.label}>User ID</Text>
            <TextInput
              style={loginStyles.input}
              value={inputUserId}
              onChangeText={setInputUserId}
              placeholder="Enter user ID"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={loginStyles.label}>Display Name</Text>
            <TextInput
              style={loginStyles.input}
              value={inputDisplayName}
              onChangeText={setInputDisplayName}
              placeholder="Enter display name"
              placeholderTextColor="#999"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[loginStyles.loginButton, (!inputUserId || !inputDisplayName) && loginStyles.loginButtonDisabled]}
              onPress={() => {
                setLoggedInUser({ userId: inputUserId, displayName: inputDisplayName });
                setLoginSessionKey((prev) => prev + 1);
              }}
              disabled={!inputUserId || !inputDisplayName}
            >
              <Text style={loginStyles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <Text style={loginStyles.tokenText}>
              📱 {Platform.OS === 'ios' ? 'APNS' : 'FCM'} Token: {fcmToken?.substring(0, 20)}...
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ===== Main App =====
  return (
    <AmityUiKitProvider
      key={`session-${loginSessionKey}`}
      configs={config} //put your config json object
      apiKey="b0ebe958398ff6361a31841d010117d9d60ddfe1eb3c3a28"
      apiRegion="eu"
      userId={loggedInUser.userId}
      displayName={loggedInUser.displayName}
      apiEndpoint="https://api.eu.amity.co"
      fcmToken={fcmToken}
    >
      <AmityUiKitSocial />
      {showNetworkLogger && <NetworkLogger />}

      {/* Network Logger toggle button */}
      <TouchableOpacity
        style={styles.networkLoggerButton}
        onPress={() => setShowNetworkLogger((v) => !v)}
      >
        <Text style={styles.logoutButtonText}>{showNetworkLogger ? '🌐 Hide Logger' : '🌐 Show Logger'}</Text>
      </TouchableOpacity>

      {/* Logout button (SDK) */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          setLoggedInUser(null);
        }}
      >
        <Text style={styles.logoutButtonText}>👤 {loggedInUser.userId} — Logout (SDK)</Text>
      </TouchableOpacity>

      {/* Logout button (API) */}
      <TouchableOpacity
        style={styles.logoutButtonApi}
        onPress={async () => {
          await logoutWithApi();
          setLoggedInUser(null);
        }}
      >
        <Text style={styles.logoutButtonText}>🔌 Logout (API)</Text>
      </TouchableOpacity>

      {/* Floating button to reopen last notification payload */}
      {notiPayload && !modalVisible && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.floatingButtonText}>🔔</Text>
        </TouchableOpacity>
      )}

      {/* Push Notification Payload Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🔔 {notiSource}</Text>
            <ScrollView style={styles.jsonScroll}>
              <Text style={styles.jsonText} selectable>
                {notiPayload}
              </Text>
            </ScrollView>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.copyButton]}
                onPress={handleCopy}
              >
                <Text style={styles.buttonText}>
                  📋 Copy to Clipboard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AmityUiKitProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  jsonScroll: {
    maxHeight: 400,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    padding: 12,
  },
  jsonText: {
    color: '#a9dc76',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: '#1a73e8',
  },
  closeButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  logoutButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 999,
  },
  logoutButtonApi: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 95 : 55,
    left: 20,
    backgroundColor: 'rgba(180,60,60,0.85)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 999,
  },
  networkLoggerButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 130 : 90,
    left: 20,
    backgroundColor: 'rgba(50,120,180,0.85)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 999,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#a0c4f1',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tokenText: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 16,
  },
});
