// Screen 3 — "Select Module"
// Shown after login. User picks Chat or Social to enter.

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {LoginConfig} from './config';

interface Props {
  config: LoginConfig;
  onSelectModule: (module: 'social' | 'chat') => void;
  /** Log out (fast) — logout(). Returns to Screen 1, form values retained. */
  onLogout: () => void;
  /** Secure log out — secureLogout() (revokes token). Returns to Screen 1. */
  onSecureLogout: () => void;
  /** Change User / edit environment — returns to Screen 1 without re-running setup(). */
  onChangeUser: () => void;
  /** Manual post-login re-pull. Only enabled when syncNetworkConfig = ON. */
  onResyncNetworkConfig: () => void;
}

const SelectModule = ({
  config,
  onSelectModule,
  onLogout,
  onSecureLogout,
  onChangeUser,
  onResyncNetworkConfig,
}: Props) => {
  // Resolve the greeting: displayName if given, otherwise the userId.
  // (spec §3.1 — no silent "Web-Test" fallback.)
  const greeting = config.displayName.trim() || config.userId.trim();
  const canResync = config.syncNetworkConfig;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Module</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── Greeting card — tappable badge edits the environment ── */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingMuted}>Logged in as </Text>
            <Text style={styles.greetingName}>{greeting}</Text>
          </View>
          <TouchableOpacity
            style={styles.badge}
            onPress={onChangeUser}
            activeOpacity={0.7}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{config.regionLabel}</Text>
            <Text style={styles.badgeEdit}>› edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Module cards ── */}
        <Text style={styles.sectionLabel}>AVAILABLE MODULES</Text>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => onSelectModule('chat')}>
          <View style={[styles.moduleIcon, styles.chatIcon]}>
            <Text style={styles.moduleEmoji}>💬</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>Chat</Text>
            <Text style={styles.moduleSubtitle}>Tap to enter →</Text>
          </View>
          <Text style={styles.moduleChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => onSelectModule('social')}>
          <View style={[styles.moduleIcon, styles.socialIcon]}>
            <Text style={styles.moduleEmoji}>👥</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>Social</Text>
            <Text style={styles.moduleSubtitle}>Tap to enter →</Text>
          </View>
          <Text style={styles.moduleChevron}>›</Text>
        </TouchableOpacity>

        {/* ── DEBUG — only enabled when Sync Network Config is ON (spec §3.7) ── */}
        <Text style={styles.sectionLabel}>DEBUG</Text>
        <TouchableOpacity
          style={[styles.plainRow, !canResync && styles.plainRowDisabled]}
          disabled={!canResync}
          onPress={onResyncNetworkConfig}>
          <Text
            style={[styles.plainRowText, !canResync && styles.disabledText]}>
            Re-sync Network Config
          </Text>
          {!canResync && (
            <Text style={styles.plainRowHint}>Enabled when Sync = ON</Text>
          )}
        </TouchableOpacity>

        {/* ── Change User → back to Screen 1 (env unchanged) ── */}
        <TouchableOpacity style={styles.plainRow} onPress={onChangeUser}>
          <Text style={styles.plainRowText}>Change User</Text>
          <Text style={styles.moduleChevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Logout actions — pinned to bottom ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.logoutBtn, styles.logoutSecondary]}
          onPress={onLogout}>
          <Text style={styles.logoutSecondaryText}>Log out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.logoutBtn, styles.logoutPrimary]}
          onPress={onSecureLogout}>
          <Text style={styles.logoutPrimaryText}>Secure log out</Text>
        </TouchableOpacity>
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
const GREEN_BG = '#E8F5E9';
const GREEN_DOT = '#43A047';
const GREEN_TEXT = '#2E7D32';

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: '700',
    color: DARK,
  },

  scroll: {paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16},

  greetingCard: {
    backgroundColor: CARD,
    borderRadius: CARD_RADIUS,
    padding: 14,
    marginBottom: 24,
  },
  greetingRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  greetingMuted: {fontSize: 14, color: LABEL},
  greetingName: {fontSize: 14, fontWeight: '600', color: DARK},
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: GREEN_BG,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN_DOT,
    marginRight: 5,
  },
  badgeText: {fontSize: 12, color: GREEN_TEXT, fontWeight: '500'},
  badgeEdit: {fontSize: 12, color: LABEL, marginLeft: 6},

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: LABEL,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  moduleCard: {
    backgroundColor: CARD,
    borderRadius: CARD_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chatIcon: {backgroundColor: '#E8EAF6'},
  socialIcon: {backgroundColor: '#E8F5E9'},
  moduleEmoji: {fontSize: 22},
  moduleInfo: {flex: 1},
  moduleTitle: {fontSize: 16, fontWeight: '600', color: DARK, marginBottom: 2},
  moduleSubtitle: {fontSize: 12, color: LABEL},
  moduleChevron: {fontSize: 22, color: BORDER},

  plainRow: {
    backgroundColor: CARD,
    borderRadius: CARD_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  plainRowDisabled: {opacity: 0.5},
  plainRowText: {fontSize: 15, color: DARK},
  plainRowHint: {fontSize: 11, color: LABEL},
  disabledText: {color: LABEL},

  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  logoutBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutSecondary: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: 10,
  },
  logoutSecondaryText: {fontSize: 15, color: DARK, fontWeight: '600'},
  logoutPrimary: {backgroundColor: DARK},
  logoutPrimaryText: {fontSize: 15, color: '#FFFFFF', fontWeight: '700'},
});

export default SelectModule;
