// Screen 1 — "React Native UI-Kit"
// LoginFlow container: manages screen state 1 → 2 → 3.

import React, {useCallback, useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';

import {VERSION_CODE} from './version.json';
import {
  DEFAULT_CONFIG,
  LoginConfig,
  REGION_CONFIG,
  REGION_LABELS,
  RegionLabel,
} from './config';
import MoreOptions from './MoreOptions';

interface Props {
  onSubmit: (config: LoginConfig) => void;
  /** Last-applied config to prefill the form (e.g. after "Change User"). Defaults to DEFAULT_CONFIG. */
  initialConfig?: LoginConfig;
}

/**
 * Login button label (spec §1.8): when any network field (region/key/upload URL)
 * has changed since the last applied environment, `setup()` will re-run, so the
 * button reads "Apply & Log in →". Otherwise it reads "Log in →".
 */
const loginLabelFor = (config: LoginConfig, applied: LoginConfig): string => {
  const envChanged =
    config.regionLabel !== applied.regionLabel ||
    config.apiKey !== applied.apiKey ||
    config.uploadUrl !== applied.uploadUrl;
  return envChanged ? 'Apply & Log in →' : 'Log in →';
};

// ── LoginFlow container ───────────────────────────────────────────────────────

const LoginFlow = ({onSubmit, initialConfig = DEFAULT_CONFIG}: Props) => {
  const [screen, setScreen] = useState<1 | 2>(1);
  const [config, setConfig] = useState<LoginConfig>(initialConfig);

  const update = useCallback((partial: Partial<LoginConfig>) => {
    setConfig(c => ({...c, ...partial}));
  }, []);

  // Hands resolved config to App.tsx, which shows SelectModule next.
  const handleLogin = useCallback(() => {
    onSubmit(config);
  }, [config, onSubmit]);

  const loginLabel = loginLabelFor(config, initialConfig);

  if (screen === 2) {
    return (
      <MoreOptions
        config={config}
        onUpdate={update}
        onBack={() => setScreen(1)}
        onLogin={handleLogin}
        loginLabel={loginLabel}
      />
    );
  }

  return (
    <Screen1
      config={config}
      onUpdate={update}
      onMoreOptions={() => setScreen(2)}
      onLogin={handleLogin}
      loginLabel={loginLabel}
    />
  );
};

// ── Screen 1 ─────────────────────────────────────────────────────────────────

interface Screen1Props {
  config: LoginConfig;
  onUpdate: (partial: Partial<LoginConfig>) => void;
  onMoreOptions: () => void;
  onLogin: () => void;
  loginLabel: string;
}

const Screen1 = ({
  config,
  onUpdate,
  onMoreOptions,
  onLogin,
  loginLabel,
}: Screen1Props) => {
  const preset = REGION_CONFIG[config.regionLabel];
  // API Key is masked by default; the eye toggle reveals it. (spec §1.5)
  const [revealApiKey, setRevealApiKey] = useState(false);

  const handleRegionChange = (label: RegionLabel) => {
    if (!label) {
      return;
    }
    const p = REGION_CONFIG[label];
    onUpdate({
      regionLabel: label,
      apiKey: p.defaultApiKey,
      uploadUrl: p.uploadUrl,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>React Native UI-Kit</Text>

        {/* ── USER ── */}
        <Text style={styles.sectionLabel}>USER</Text>
        <View style={styles.section}>
          {/* User ID */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>User ID</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                value={config.userId}
                onChangeText={t => onUpdate({userId: t})}
                placeholder="rn-test"
                placeholderTextColor="#C7C7CC"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {config.userId.length > 0 && (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => onUpdate({userId: ''})}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>✕</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Display Name */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Display Name (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={config.displayName}
              onChangeText={t => onUpdate({displayName: t})}
              placeholder="Optional — leave blank to omit"
              placeholderTextColor="#C7C7CC"
            />
          </View>

          <View style={styles.rowDivider} />

          {/* User Type */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>User Type</Text>
            <View style={styles.pickerWrap}>
              <RNPickerSelect
                onValueChange={value => {
                  if (value != null) {
                    onUpdate({userType: value});
                  }
                }}
                value={config.userType}
                items={[
                  {label: 'Signed-in', value: 'signed-in'},
                  {label: 'Visitor', value: 'visitor'},
                ]}
                placeholder={{}}
                useNativeAndroidPickerStyle={false}
                style={pickerStyles}
                Icon={() => <Text style={styles.pickerChevron}>⌄</Text>}
              />
            </View>
          </View>
        </View>

        {/* ── NETWORK ── */}
        <Text style={styles.sectionLabel}>NETWORK</Text>
        <View style={styles.section}>
          {/* API Region */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>API Region</Text>
            <View style={styles.pickerWrap}>
              <RNPickerSelect
                onValueChange={value => {
                  if (value != null) {
                    handleRegionChange(value);
                  }
                }}
                value={config.regionLabel}
                items={REGION_LABELS.map(l => ({label: l, value: l}))}
                placeholder={{}}
                useNativeAndroidPickerStyle={false}
                style={pickerStyles}
                Icon={() => <Text style={styles.pickerChevron}>⌄</Text>}
              />
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* API Key — masked by default; 👁 reveals; ✕ clears the field so a
              custom key can be entered for any region (incl. Staging). Switching
              region re-fills that region's default key. */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>API Key (linked to region)</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.textInput, styles.mono]}
                value={config.apiKey}
                onChangeText={t => onUpdate({apiKey: t})}
                secureTextEntry={!revealApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setRevealApiKey(r => !r)}>
                <Text style={styles.eyeText}>{revealApiKey ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
              {config.apiKey?.length > 0 && (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => onUpdate({apiKey: ''})}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>✕</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Upload URL */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Upload URL (linked to region)</Text>
            <TextInput
              style={[styles.textInput, styles.mono]}
              value={config.uploadUrl}
              onChangeText={t => onUpdate({uploadUrl: t})}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* ── More Options nav row ── */}
        <TouchableOpacity style={styles.moreOptionsRow} onPress={onMoreOptions}>
          <View style={styles.moreOptionsIconBox}>
            <Text style={styles.moreOptionsIconText}>⚙</Text>
          </View>
          <Text style={styles.moreOptionsLabel}>Advanced options...</Text>
          <Text style={styles.moreOptionsChevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Log in button + build info — pinned to bottom ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
          <Text style={styles.loginBtnText}>{loginLabel}</Text>
        </TouchableOpacity>
        <Text style={styles.buildInfo}>
          Build {VERSION_CODE} · {preset.sdkRegion}
        </Text>
      </View>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const CARD_RADIUS = 12;
const BG = '#F2F2F7';
const CARD = '#FFFFFF';
const DARK = '#1C1C1E';
const LABEL = '#8E8E93';
const BORDER = '#D1D1D6';

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: BG},
  scroll: {paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16},

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: DARK,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: LABEL,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  section: {
    backgroundColor: CARD,
    borderRadius: CARD_RADIUS,
    marginBottom: 20,
    overflow: 'hidden',
  },

  fieldRow: {paddingHorizontal: 14, paddingVertical: 10},
  fieldLabel: {fontSize: 12, color: LABEL, marginBottom: 4},
  rowDivider: {height: 1, backgroundColor: BORDER, marginLeft: 14},

  inputWrap: {flexDirection: 'row', alignItems: 'center'},
  textInput: {flex: 1, fontSize: 15, color: DARK, paddingVertical: 2},
  mono: {fontFamily: 'Courier', fontSize: 12, color: '#555'},

  pickerWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
  },
  pickerChevron: {
    fontSize: 18,
    color: LABEL,
    lineHeight: 22,
  },

  iconBtn: {marginLeft: 8},
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {fontSize: 10, color: '#FFFFFF', fontWeight: '700'},
  eyeText: {fontSize: 16},

  moreOptionsRow: {
    backgroundColor: CARD,
    borderRadius: CARD_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  moreOptionsIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  moreOptionsIconText: {fontSize: 14},
  moreOptionsLabel: {flex: 1, fontSize: 15, color: DARK},
  moreOptionsChevron: {fontSize: 20, color: BORDER},

  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  loginBtn: {
    backgroundColor: DARK,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginBtnText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},

  buildInfo: {
    textAlign: 'center',
    fontSize: 11,
    color: LABEL,
  },
});

export const pickerStyles = {
  inputIOS: {
    fontSize: 15,
    color: DARK,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingRight: 32,
  },
  inputAndroid: {
    fontSize: 15,
    color: DARK,
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingRight: 32,
  },
  iconContainer: {
    top: Platform.OS === 'ios' ? 9 : 7,
    right: 10,
  },
};

export default LoginFlow;
