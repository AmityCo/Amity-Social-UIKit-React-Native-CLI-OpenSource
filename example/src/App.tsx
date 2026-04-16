import * as React from 'react';
import {
  AmityUiKitProvider,
  AmityUiKitSocial,
} from '@amityco/react-native-social-uikit';
import config from '../uikit.config.json';
import messaging from '@react-native-firebase/messaging';
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
} from 'react-native';


messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('🔔 Background notification:', JSON.stringify(remoteMessage, null, 2));
});

export default function App() {
  const [fcmToken, setFcmToken] = useState(null);
  console.log('fcmToken: ', fcmToken);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notiPayload, setNotiPayload] = useState<string | null>(null);
  const [notiSource, setNotiSource] = useState('');

  const showPayload = useCallback((source: string, message: any) => {
    const json = JSON.stringify(message, null, 2);
    console.log(`🔔 ${source}:`, json);
    setNotiSource(source);
    setNotiPayload(json);
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
        showPayload('Clicked (from background)', remoteMessage);
      });

      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            showPayload('Clicked (from quit state)', remoteMessage);
          }
        });
      unsubscribe = messaging().onMessage(async (remoteMessage) => {
        showPayload('Foreground notification', remoteMessage);
      });
    }

    return () => unsubscribe?.();
  }, [permissionGranted]);

  if (!fcmToken) return null;
  return (
    <AmityUiKitProvider
      configs={config} //put your config json object
      apiKey="b0ebe958398ff6361a31841d010117d9d60ddfe1eb3c3a28"
      apiRegion="sg"
      userId="topSocialPlus"
      displayName="topSocialPlus"
      apiEndpoint="https://api.eu.amity.co"
      fcmToken={fcmToken}
    >
      <AmityUiKitSocial />

      {/* Push Notification Payload Modal */}
      <Modal
        visible={notiPayload !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setNotiPayload(null)}
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
                  📋 Copy / Share
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => setNotiPayload(null)}
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
});
