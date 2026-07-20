import { navigate } from '@amityco/react-native-social-uikit';
import VisitorScreen from './VisitorScreen';
import SignedInScreen from './SignedInScreen';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import { LogBox } from 'react-native';

const API_KEY = "YOUR_API_KEY"; // Put your apiKey
const API_REGION = "API_REGION"; // Put your apiRegion
const API_ENDPOINT ="API_ENDPOINT" //"https://api.{apiRegion}.amity.co"


type TabName = 'visitor' | 'signedIn';

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
  const [showLogger, setShowLogger] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [tab, setTab] = useState<TabName>('visitor');

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
    <View style={styles.appRoot}>
      <View style={styles.screenArea}>
        {/* Only the active tab is mounted. Each screen owns its own
            AmityUiKitProvider (and its own login), so keeping just one mounted
            avoids two providers logging in at once. Keying by tab forces a
            clean remount when switching so the provider re-runs login. */}
        {tab === 'visitor' ? (
          <VisitorScreen
            key="visitor"
            apiKey={API_KEY}
            apiRegion={API_REGION}
            apiEndpoint={API_ENDPOINT}
            fcmToken={fcmToken} // android:fcm iOS:APN
          />
        ) : (
          <SignedInScreen
            key="signedIn"
            apiKey={API_KEY}
            apiRegion={API_REGION}
            apiEndpoint={API_ENDPOINT}
            fcmToken={fcmToken}
            // Sign in directly as this user — no visitor / create-profile step.
            userId="visitor-user-test-10"
            // displayName intentionally omitted to test the "userId only" login
            // path (existing displayName is preserved, not overwritten).
          />
        )}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setTab('visitor')}
        >
          <Text
            style={[styles.tabLabel, tab === 'visitor' && styles.tabLabelActive]}
          >
            Visitor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setTab('signedIn')}
        >
          <Text
            style={[
              styles.tabLabel,
              tab === 'signedIn' && styles.tabLabelActive,
            ]}
          >
            Signed-in
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full-screen network logger overlay, toggled by the floating button. */}
      {showLogger && (
        <View style={styles.loggerOverlay}>
          <View style={styles.loggerContainer}>
            <NetworkLogger />
          </View>
        </View>
      )}

      {/* Floating Show/Hide button, always on top. */}
      <TouchableOpacity
        style={styles.loggerToggle}
        onPress={() => setShowLogger((v) => !v)}
      >
        <Text style={styles.loggerToggleText}>
          {showLogger ? 'Hide Logs' : 'Show Logs'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  screenArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d9dbe0',
    backgroundColor: '#ffffff',
    paddingBottom: 24, // clear the home indicator
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#898e9e',
  },
  tabLabelActive: {
    color: '#1054de',
  },
  loggerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  loggerContainer: {
    flex: 1,
    // Leave room at the top for the status bar and the floating toggle button.
    paddingTop: 100,
  },
  loggerToggle: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 20,
    backgroundColor: '#1054de',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  loggerToggleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

