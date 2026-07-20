// Screen 2 — "Local Custom"
// Advanced toggles: Security, Behaviour, Appearance.

import React, {useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import {VERSION_CODE} from './version.json';
import {LoginConfig, REGION_CONFIG, Theme} from './config';

interface Props {
  config: LoginConfig;
  onUpdate: (partial: Partial<LoginConfig>) => void;
  onBack: () => void;
  onLogin: () => void;
  loginLabel: string;
}

const THEMES: Theme[] = ['default', 'light', 'dark'];
const THEME_LABELS: Record<Theme, string> = {
  default: 'Default',
  light: 'Light',
  dark: 'Dark',
};

const MoreOptions = ({config, onUpdate, onBack, onLogin, loginLabel}: Props) => {
  // Android date picker needs explicit show state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const preset = REGION_CONFIG[config.regionLabel];

  // Auth Signature URL field is shown whenever Secure Mode is ON (spec §2.2).
  const showAuthUrl = config.secureMode;
  // Expiry picker is shown only for visitor + secure mode (spec §2.3).
  const showAuthExpiry =
    config.userType === 'visitor' && config.secureMode;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">

        {/* ── SECURITY ── */}
        <Text style={styles.sectionLabel}>SECURITY</Text>
        <View style={styles.section}>
          <ToggleRow
            label="Secure Mode"
            value={config.secureMode}
            onToggle={v => onUpdate({secureMode: v})}
          />

          {showAuthUrl && (
            <>
              <View style={styles.rowDivider} />
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Auth Signature URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={config.authSignatureUrl}
                  onChangeText={t => onUpdate({authSignatureUrl: t})}
                  placeholder="https://my-server/auth-signature"
                  placeholderTextColor="#C7C7CC"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
            </>
          )}

          {showAuthExpiry && (
            <>
              <View style={styles.rowDivider} />
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Auth Signature Expires At</Text>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={config.authSignatureExpiresAt}
                    mode="datetime"
                    display="compact"
                    onChange={(_e, date) =>
                      date && onUpdate({authSignatureExpiresAt: date})
                    }
                    style={styles.datePicker}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dateBtn}
                      onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.dateBtnText}>
                        {config.authSignatureExpiresAt.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={config.authSignatureExpiresAt}
                        mode="datetime"
                        display="default"
                        onChange={(_e, date) => {
                          setShowDatePicker(false);
                          date && onUpdate({authSignatureExpiresAt: date});
                        }}
                      />
                    )}
                  </>
                )}
              </View>
            </>
          )}
        </View>

        {/* ── BEHAVIOUR ── */}
        {/* NOTE: "Visitor Can View Clip" is Web/Storybook only (spec §2.4) — not shown on mobile. */}
        <Text style={styles.sectionLabel}>BEHAVIOUR</Text>
        <View style={styles.section}>
          <ToggleRow
            label="Hide Explore"
            value={config.hideExplore}
            onToggle={v => onUpdate({hideExplore: v})}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            label="Social Community Creation Button"
            value={config.socialCommunityCreationButtonVisible}
            onToggle={v => onUpdate({socialCommunityCreationButtonVisible: v})}
          />
        </View>

        {/* ── APPEARANCE ── */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.section}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Theme</Text>
            <View style={styles.segmentedControl}>
              {THEMES.map((t, i) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.segment,
                    i === 0 && styles.segmentFirst,
                    i === THEMES.length - 1 && styles.segmentLast,
                    config.theme === t && styles.segmentActive,
                  ]}
                  onPress={() => onUpdate({theme: t})}>
                  <Text
                    style={[
                      styles.segmentText,
                      config.theme === t && styles.segmentTextActive,
                    ]}>
                    {THEME_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.rowDivider} />
          {/* Sync Network Config lives with appearance/customization (spec §2.8):
              it runs after login and can override the toggles above. */}
          <ToggleRow
            label="Sync Network Config"
            sub="Applied after login — overrides settings above when ON"
            value={config.syncNetworkConfig}
            onToggle={v => onUpdate({syncNetworkConfig: v})}
          />
        </View>

      </ScrollView>

      {/* ── Log in button — pinned to bottom ── */}
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

// ── ToggleRow helper ──────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  /** Optional helper text shown under the label. */
  sub?: string;
}

const ToggleRow = ({label, value, onToggle, sub}: ToggleRowProps) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleLabelWrap}>
      <Text style={styles.toggleLabel}>{label}</Text>
      {sub ? <Text style={styles.toggleSub}>{sub}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{false: '#D1D1D6', true: '#1C1C1E'}}
      thumbColor="#FFFFFF"
    />
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const CARD_RADIUS = 12;
const BG = '#F2F2F7';
const CARD = '#FFFFFF';
const DARK = '#1C1C1E';
const LABEL = '#8E8E93';
const BORDER = '#D1D1D6';
const BLUE = '#4F5BD5';

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {width: 70},
  backText: {fontSize: 16, color: BLUE},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: DARK,
  },

  scroll: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16},

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

  rowDivider: {height: 1, backgroundColor: BORDER, marginLeft: 14},

  fieldRow: {paddingHorizontal: 14, paddingVertical: 10},
  fieldLabel: {fontSize: 12, color: LABEL, marginBottom: 6},
  textInput: {fontSize: 15, color: DARK, paddingVertical: 2},

  datePicker: {alignSelf: 'flex-start'},
  dateBtn: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateBtnText: {fontSize: 14, color: DARK},

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleLabelWrap: {flex: 1, paddingRight: 12},
  toggleLabel: {fontSize: 15, color: DARK},
  toggleSub: {fontSize: 11, color: LABEL, marginTop: 3},

  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: CARD,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  segmentFirst: {borderTopLeftRadius: 8, borderBottomLeftRadius: 8},
  segmentLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderRightWidth: 0,
  },
  segmentActive: {backgroundColor: DARK},
  segmentText: {fontSize: 13, color: DARK, fontWeight: '500'},
  segmentTextActive: {color: '#FFFFFF'},

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
  },
  loginBtnText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},

  buildInfo: {
    textAlign: 'center',
    fontSize: 11,
    color: LABEL,
    marginTop: 10,
  },
});

export default MoreOptions;
