import React, {useCallback, useEffect, useRef, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Client} from '@amityco/ts-sdk-react-native';
import NetworkLogger from 'react-native-network-logger';

import {
  AmityUiKitProvider,
  AmityUiKitSocial,
  AmityUiKitChat,
} from '@amityco/react-native-social-uikit';
import configs from '../uikit.config.json';

// Chat + Social share the same provider in this repo (single package).
const AmityChatUiKitProvider = AmityUiKitProvider;

import LoginPage from './Login';
import SelectModule from './SelectModule';
import {
  DEFAULT_CONFIG,
  LoginConfig,
  PLATFORM_DEFAULT_USER_ID,
  REGION_CONFIG,
} from './config';

// ILoginForm: resolved login data passed to SDK providers.
// `module` is tracked separately as activeModule state.
export interface ILoginForm extends LoginConfig {
  apiRegion: 'staging' | 'sg' | 'eu' | 'us'; // valid SDK region (API_REGIONS enum)
  apiEndpoint?: string; // custom endpoint override for staging/dev
  // displayName stays as entered: omitted (empty) when blank — never substituted
  // with userId (spec §1.2 / ID-2).
}

export default function App() {
  const [form, setForm] = useState<ILoginForm | undefined>();
  // Last-entered login config, used to prefill Screen 1 after Change User / logout
  // so the environment + form values are retained (spec — "form values retained").
  const [draftConfig, setDraftConfig] = useState<LoginConfig>(DEFAULT_CONFIG);
  const [activeModule, setActiveModule] = useState<
    'social' | 'chat' | undefined
  >();
  const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
  // Manual debug flag — set to true to show the in-app network logger overlay.
  // Defaults to false. Request capture is started in index.js via startNetworkLogging().
  const showNetworkLogger = false;

  async function requestNotificationPermission() {
    const enabled = await messaging().hasPermission();
    const granted =
      enabled === messaging.AuthorizationStatus.AUTHORIZED ||
      enabled === messaging.AuthorizationStatus.PROVISIONAL;
    if (granted) {
      return true;
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        'android.permission.POST_NOTIFICATIONS',
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    const result = await messaging().requestPermission();
    return (
      result === messaging.AuthorizationStatus.AUTHORIZED ||
      result === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  async function getFcmToken() {
    return Platform.OS === 'ios'
      ? await messaging().getAPNSToken()
      : await messaging().getToken();
  }

  useEffect(() => {
    const setup = async () => {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return;
      }
      const token = await getFcmToken();
      // token may be null on iOS Simulator (no APN); that's fine — push
      // notifications simply won't work, but the social/chat feeds will.
      if (token) {
        console.log('FCM Token:', token);
        setFcmToken(token);
      }
    };
    setup();
  }, []);

  const handleLogin = useCallback((config: LoginConfig) => {
    // Blank userId → platform default (spec §1.1). Blank displayName → keep blank;
    // it is omitted, never substituted with userId (spec §1.2).
    const resolvedUserId = config.userId.trim() || PLATFORM_DEFAULT_USER_ID;
    const preset = REGION_CONFIG[config.regionLabel];
    setDraftConfig(config); // retain entered values for Change User / logout
    setForm({
      ...config,
      userId: resolvedUserId,
      displayName: config.displayName.trim(), // '' when blank → omitted below
      apiRegion: preset.apiRegion, // valid SDK enum: 'sg' | 'eu' | 'us'
      apiEndpoint: preset.apiEndpoint, // undefined for production, custom URL for staging/dev
    });
    setActiveModule(undefined);
  }, []);

  // Guards against concurrent / rapid-repeat logout calls, which hammer the
  // auth endpoint and trigger "RateLimit Exceeded" (400311).
  const logoutInFlight = useRef(false);

  // Shared teardown: only call the SDK when a client is actually connected,
  // otherwise just reset the UI. Skipping the call when not connected avoids
  // hitting the auth/session endpoint with nothing to log out of.
  const performLogout = useCallback(async (secure: boolean) => {
    if (logoutInFlight.current) {
      return;
    }
    logoutInFlight.current = true;
    try {
      if (Client.isConnected()) {
        await (secure ? Client.secureLogout() : Client.logout());
      }
    } catch (e) {
      console.warn(`[Login] ${secure ? 'secureLogout' : 'logout'} failed:`, e);
    } finally {
      logoutInFlight.current = false;
      setForm(undefined);
      setActiveModule(undefined);
    }
  }, []);

  // Log out (fast) — Client.logout() from @amityco/ts-sdk-react-native.
  const handleLogout = useCallback(() => performLogout(false), [performLogout]);

  // Secure log out — Client.secureLogout() from @amityco/ts-sdk-react-native
  // (revokes the access token on the server before disconnecting).
  const handleSecureLogout = useCallback(
    () => performLogout(true),
    [performLogout],
  );

  // Change User — return to Screen 1 without clearing the environment (env
  // unchanged, no re-setup). Form is prefilled from draftConfig.
  const handleChangeUser = useCallback(() => {
    setForm(undefined);
    setActiveModule(undefined);
  }, []);

  // Re-sync Network Config — manual post-login re-pull. Only invoked when
  // syncNetworkConfig = ON (the row is disabled otherwise on Screen 3).
  const handleResyncNetworkConfig = useCallback(() => {
    console.log('[UIKit] Re-sync Network Config requested');
  }, []);

  const handleBackToModules = useCallback(() => {
    setActiveModule(undefined);
  }, []);

  // ── No extra useMemo needed for socialCommunityCreationButtonVisible ─────────
  // The open-source SDK's AmityUiKitProvider now accepts the prop directly and
  // handles injecting the exclude keys + any needed behaviour overrides.

  // ── Early returns (after all hooks) ─────────────────────────────────────────

  // ── Not logged in → Login flow (Screens 1 + 2) ──────────────────────────────
  if (!form) {
    return <LoginPage onSubmit={handleLogin} initialConfig={draftConfig} />;
  }

  // ── Logged in, no module selected → Select Module (Screen 3) ────────────────
  if (!activeModule) {
    return (
      <SelectModule
        config={form}
        onSelectModule={setActiveModule}
        onLogout={handleLogout}
        onSecureLogout={handleSecureLogout}
        onChangeUser={handleChangeUser}
        onResyncNetworkConfig={handleResyncNetworkConfig}
      />
    );
  }

  // ── Inside a module — wait for FCM token before mounting SDK providers.
  // This prevents a re-render of AmityUiKitProvider when the token arrives,
  // which can disrupt the SDK's Client.createClient / session lifecycle.
  // fcmToken gate skipped for dev/QA (no Firebase needed to mount the UIKit).
  // if (!fcmToken) {
  //   return null;
  // }

  // ── Inside a module → header row + SDK content below ───────────────────────
  // form.apiEndpoint is set for staging/dev, undefined for production regions
  // (SDK derives the correct URL from apiRegion automatically for eu/sg/us).
  const apiEndpoint = form.apiEndpoint;

  const moduleContent =
    activeModule === 'social' ? (
      <AmityUiKitProvider
        configs={configs}
        apiKey={form.apiKey}
        apiRegion={form.apiRegion}
        userId={form.userId}
        displayName={form.displayName || undefined}
        fcmToken={fcmToken}
        apiEndpoint={apiEndpoint}
        socialCommunityCreationButtonVisible={
          form.socialCommunityCreationButtonVisible
        }
        hideExplore={form.hideExplore}>
        <AmityUiKitSocial />
      </AmityUiKitProvider>
    ) : (
      <AmityChatUiKitProvider
        apiKey={form.apiKey}
        apiRegion={form.apiRegion}
        userId={form.userId}
        displayName={form.displayName}
        apiEndpoint={apiEndpoint}
        fcmToken={fcmToken}>
        <AmityUiKitChat />
      </AmityChatUiKitProvider>
    );

  return (
    <View style={styles.moduleContainer}>
      <View style={styles.moduleNavHeader}>
        <TouchableOpacity
          onPress={handleBackToModules}
          activeOpacity={0.6}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 24}}
          style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.moduleContent}>{moduleContent}</View>

      {/* Network logger — shown only when the manual debug flag is on */}
      {showNetworkLogger && (
        <View style={styles.loggerOverlay}>
          <NetworkLogger />
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

// Status bar height for Android (iOS handled via paddingTop below)
const ANDROID_STATUS_BAR = StatusBar.currentHeight ?? 24;

const styles = StyleSheet.create({
  moduleContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Header row: occupies safe area + a small row for the back chevron
  moduleNavHeader: {
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 54 : ANDROID_STATUS_BAR,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  // Bottom-half panel so the rest of the module UI stays visible/usable.
  loggerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#333',
    zIndex: 10,
  },
  backChevron: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  moduleContent: {
    flex: 1,
  },
});
