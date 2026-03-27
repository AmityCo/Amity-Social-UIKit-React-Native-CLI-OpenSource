import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AmityUiKitProvider,
  AmityUiKitSocial,
} from '@amityco/react-native-social-uikit';
import lightConfig from '../uikit.config.json';
import messaging from '@react-native-firebase/messaging';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// ─── Environment Presets ────────────────────────────────────────────
type EnvironmentKey = 'financial' | 'sport' | 'travel' | 'custom';

interface EnvironmentConfig {
  label: string;
  apiKey: string;
  apiRegion: string;
  apiEndpoint: string;
}

const ENVIRONMENTS: Record<EnvironmentKey, EnvironmentConfig> = {
  financial: {
    label: '🏦  Financial',
    apiKey: 'b0e9be093adef06c48378a4f520a128ad90888e5e9313928',
    apiRegion: 'eu',
    apiEndpoint: 'https://api.eu.amity.co',
  },
  sport: {
    label: '⚽  Sport',
    apiKey: 'b0e9be093adef336183f8a4a53014088d15ad8b0ec3d3924',
    apiRegion: 'eu',
    apiEndpoint: 'https://api.eu.amity.co',
  },
  travel: {
    label: '✈️  Travel',
    apiKey: 'b0e9be093adef66d4c3f8c1d065b408e840bdde2e8666f79',
    apiRegion: 'eu',
    apiEndpoint: 'https://api.eu.amity.co',
  },
  custom: {
    label: '⚙️  Custom',
    apiKey: '',
    apiRegion: '',
    apiEndpoint: '',
  },
};

// ─── Background Messaging ───────────────────────────────────────────
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background notification:', remoteMessage);
});

// ─── Theme helpers ──────────────────────────────────────────────────
const buildConfig = (isDark: boolean) => {
  return {
    ...lightConfig,
    preferred_theme: isDark ? 'dark' : 'light',
  };
};

// ─── Colors (iOS 26 / Liquid Glass inspired) ────────────────────────
const palette = {
  pink: '#FF6FD8',
  blue: '#3D5CFF',
  orange: '#FFB347',
  cyan: '#00D2FF',
  white: '#FFFFFF',
  offWhite: '#F5F6FA',
  lightGray: '#E8EAF0',
  midGray: '#A0A4B8',
  darkGray: '#3A3D4A',
  nearBlack: '#1C1E2A',
  black: '#000000',
  accent: '#4F46E5',
  accentLight: '#7C78FF',
};

// ─── Main App ───────────────────────────────────────────────────────
export default function App() {
  // ── FCM ──
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // ── Login state ──
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [userId, setUserId] = useState('johnwick');
  const [displayName, setDisplayName] = useState('John Wick');
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentKey>('financial');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customApiRegion, setCustomApiRegion] = useState('');

  // ── Theme ──
  const [isDark, setIsDark] = useState(false);

  // ── Derived ──
  const env = ENVIRONMENTS[selectedEnv];
  const activeApiKey = selectedEnv === 'custom' ? customApiKey : env.apiKey;
  const activeApiRegion =
    selectedEnv === 'custom' ? customApiRegion : env.apiRegion;
  const activeEndpoint =
    selectedEnv === 'custom'
      ? `https://api.${customApiRegion}.amity.co`
      : env.apiEndpoint;

  const uikitConfig = useMemo(() => buildConfig(isDark), [isDark]);
  const canLogin =
    userId.trim().length > 0 &&
    activeApiKey.length > 0 &&
    activeApiRegion.length > 0;

  // ── FCM Permission ──
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
              .finally(() => setPermissionGranted(granted));
          } else {
            messaging()
              .requestPermission()
              .then((result) => {
                granted =
                  result === messaging.AuthorizationStatus.AUTHORIZED ||
                  result === messaging.AuthorizationStatus.PROVISIONAL;
              })
              .finally(() => setPermissionGranted(granted));
          }
        }
      })
      .catch(console.log)
      .finally(() => setPermissionGranted(granted));

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
        .then(async (token) => setFcmToken(token ?? null))
        .catch(console.log);

      messaging().onNotificationOpenedApp((msg) =>
        console.log('Notification opened from bg:', msg.notification)
      );

      messaging()
        .getInitialNotification()
        .then((msg) => {
          if (msg)
            console.log('Notification opened from quit:', msg.notification);
        });

      unsubscribe = messaging().onMessage(async (msg) =>
        console.log('Foreground message:', msg)
      );
    }
    return () => unsubscribe?.();
  }, [permissionGranted]);

  // ── Handlers ──
  const handleLogin = useCallback(() => {
    Keyboard.dismiss();
    setSessionKey((k) => k + 1);
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // ── Dynamic colors ──
  const colors = isDark
    ? {
        bg: palette.nearBlack,
        card: 'rgba(255,255,255,0.06)',
        cardBorder: 'rgba(255,255,255,0.10)',
        text: palette.white,
        textSecondary: palette.midGray,
        inputBg: 'rgba(255,255,255,0.08)',
        inputBorder: 'rgba(255,255,255,0.12)',
        accent: palette.accentLight,
        pill: 'rgba(255,255,255,0.08)',
        pillActive: palette.accent,
        pillText: palette.midGray,
        pillTextActive: palette.white,
        topBarBg: 'rgba(28,30,42,0.85)',
      }
    : {
        bg: palette.offWhite,
        card: palette.white,
        cardBorder: palette.lightGray,
        text: palette.nearBlack,
        textSecondary: palette.midGray,
        inputBg: palette.offWhite,
        inputBorder: palette.lightGray,
        accent: palette.accent,
        pill: palette.lightGray,
        pillActive: palette.accent,
        pillText: palette.darkGray,
        pillTextActive: palette.white,
        topBarBg: 'rgba(255,255,255,0.85)',
      };

  // ─── Social Screen (after login) ─────────────────────────────────
  if (isLoggedIn) {
    return (
      <AmityUiKitProvider
        key={`session-${sessionKey}`}
        configs={uikitConfig as any}
        apiKey={activeApiKey}
        apiRegion={activeApiRegion}
        userId={userId.trim()}
        displayName={displayName.trim() || userId.trim()}
        apiEndpoint={activeEndpoint}
        fcmToken={fcmToken ?? undefined}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={colors.bg}
          />
          {/* ── Top Bar ── */}
          <View
            style={[
              styles.topBar,
              {
                backgroundColor: colors.topBarBg,
                borderBottomColor: colors.cardBorder,
              },
            ]}
          >
            <TouchableOpacity onPress={handleLogout} style={styles.topBarBtn}>
              <Text style={[styles.topBarBtnText, { color: colors.accent }]}>
                ← Logout
              </Text>
            </TouchableOpacity>

            <View style={styles.topBarCenter}>
              <Text style={[styles.topBarTitle, { color: colors.text }]}>
                Social.plus
              </Text>
              <Text
                style={[styles.topBarSubtitle, { color: colors.textSecondary }]}
              >
                {env.label.replace(/[^\w\s]/g, '').trim()} · {userId.trim()}
              </Text>
            </View>

            <TouchableOpacity onPress={toggleTheme} style={styles.topBarBtn}>
              <Text style={{ fontSize: 22 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>

          <AmityUiKitSocial />
        </SafeAreaView>
      </AmityUiKitProvider>
    );
  }

  // ─── Login Screen ─────────────────────────────────────────────────
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.loginRoot, { backgroundColor: colors.bg }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.bg}
        />

        {/* Theme toggle (top‑right) */}
        <View style={styles.loginThemeRow}>
          <View style={[styles.themeChip, { backgroundColor: colors.pill }]}>
            <Text style={{ fontSize: 14 }}>{isDark ? '🌙' : '☀️'}</Text>
            <Text style={[styles.themeChipText, { color: colors.text }]}>
              {isDark ? 'Dark' : 'Light'}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.loginScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Logo ── */}
            <View style={styles.brandBlock}>
              <Image
                source={require('./assets/socialplus.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text
                style={[styles.appSubtitle, { color: colors.textSecondary }]}
              >
                Experience the power of in‑app social features
              </Text>
            </View>

            {/* ── Card ── */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              {/* Environment Picker */}
              <Text
                style={[styles.sectionLabel, { color: colors.textSecondary }]}
              >
                ENVIRONMENT
              </Text>
              <View style={styles.pillRow}>
                {(Object.keys(ENVIRONMENTS) as EnvironmentKey[]).map((key) => {
                  const isActive = selectedEnv === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setSelectedEnv(key)}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isActive
                            ? colors.pillActive
                            : colors.pill,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          {
                            color: isActive
                              ? colors.pillTextActive
                              : colors.pillText,
                          },
                        ]}
                      >
                        {ENVIRONMENTS[key].label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Custom fields (only when "Custom" is selected) */}
              {selectedEnv === 'custom' && (
                <>
                  <Text
                    style={[
                      styles.sectionLabel,
                      { color: colors.textSecondary, marginTop: 16 },
                    ]}
                  >
                    CUSTOM CONNECTION
                  </Text>
                  <TextInput
                    placeholder="API Key"
                    placeholderTextColor={palette.midGray}
                    value={customApiKey}
                    onChangeText={setCustomApiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      },
                    ]}
                  />
                  <TextInput
                    placeholder="API Region (e.g. us, eu, sg)"
                    placeholderTextColor={palette.midGray}
                    value={customApiRegion}
                    onChangeText={setCustomApiRegion}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      },
                    ]}
                  />
                </>
              )}

              {/* User fields */}
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textSecondary, marginTop: 20 },
                ]}
              >
                USER
              </Text>
              <TextInput
                placeholder="User ID *"
                placeholderTextColor={palette.midGray}
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
              />
              <TextInput
                placeholder="Display Name (optional)"
                placeholderTextColor={palette.midGray}
                value={displayName}
                onChangeText={setDisplayName}
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
              />

              {/* UIKit Theme */}
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textSecondary, marginTop: 20 },
                ]}
              >
                UIKIT THEME
              </Text>
              <View style={styles.themeSwitchRow}>
                <Pressable
                  onPress={() => setIsDark(false)}
                  style={[
                    styles.themeSwitchBtn,
                    {
                      backgroundColor: !isDark
                        ? colors.pillActive
                        : colors.pill,
                      borderTopLeftRadius: 14,
                      borderBottomLeftRadius: 14,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>☀️</Text>
                  <Text
                    style={[
                      styles.themeSwitchLabel,
                      {
                        color: !isDark
                          ? colors.pillTextActive
                          : colors.pillText,
                      },
                    ]}
                  >
                    Light
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsDark(true)}
                  style={[
                    styles.themeSwitchBtn,
                    {
                      backgroundColor: isDark ? colors.pillActive : colors.pill,
                      borderTopRightRadius: 14,
                      borderBottomRightRadius: 14,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>🌙</Text>
                  <Text
                    style={[
                      styles.themeSwitchLabel,
                      {
                        color: isDark ? colors.pillTextActive : colors.pillText,
                      },
                    ]}
                  >
                    Dark
                  </Text>
                </Pressable>
              </View>

              {/* Login button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={!canLogin}
                activeOpacity={0.8}
                style={[
                  styles.loginBtn,
                  {
                    backgroundColor: canLogin ? colors.accent : colors.pill,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.loginBtnText,
                    {
                      color: canLogin ? palette.white : colors.pillText,
                    },
                  ]}
                >
                  Launch UIKit →
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={[styles.footer, { color: colors.textSecondary }]}>
              Powered by Social.plus · UIKit Demo
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Login ──
  loginRoot: {
    flex: 1,
  },
  loginThemeRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  loginScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  logo: {
    width: 220,
    height: 180,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 10,
  },
  loginBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },

  // ── Top Bar (social screen) ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 64,
  },
  topBarBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  topBarCenter: {
    alignItems: 'center',
    flex: 1,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  topBarSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },

  // ── Theme Chip (login top-right indicator) ──
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  themeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Theme Switch (inside card) ──
  themeSwitchRow: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  themeSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  themeSwitchLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
