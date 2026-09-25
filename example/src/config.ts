// ── Shared config for the Login flow ─────────────────────────────────────────
// Matches the spec: 30-login-ui-kit.md

// Region config is sourced from .env (via react-native-dotenv → '@env'), mirroring
// the web UI-Kit. Each value keeps a safe fallback equal to the previous hardcoded
// default, so a missing .env entry can never break the SDK connection.
import {
  // API keys (sensitive)
  API_KEY_STAGING,
  API_KEY_SG,
  API_KEY_EU,
  API_KEY_US,
  // SDK region label (build-footer display)
  SDK_REGION_STAGING,
  SDK_REGION_SG,
  SDK_REGION_EU,
  SDK_REGION_US,
  // Valid SDK region enum ('sg' | 'eu' | 'us')
  API_REGION_STAGING,
  API_REGION_SG,
  API_REGION_EU,
  API_REGION_US,
  // Upload URLs
  UPLOAD_URL_STAGING,
  UPLOAD_URL_SG,
  UPLOAD_URL_EU,
  UPLOAD_URL_US,
  // Custom HTTP endpoint (Staging only; standard regions derive from apiRegion)
  API_ENDPOINT_STAGING,
} from '@env';

export type RegionLabel = 'Staging' | 'SG' | 'EU' | 'US';
export type UserType = 'signed-in' | 'visitor';
export type Theme = 'default' | 'light' | 'dark';
type ApiRegion = 'staging' | 'sg' | 'eu' | 'us';

export interface RegionPreset {
  /** Human-readable region label shown in the build info footer */
  sdkRegion: string;
  /** Region slug the SDK interpolates into its endpoint templates
   * (https://apix.{region}.amity.co, wss://sse.{region}.amity.co:443/mqtt, …).
   * It is NOT restricted to the API_REGIONS enum — 'staging' is a valid slug.
   * Setting this to 'sg' for Staging points MQTT at the production SG broker
   * while HTTP uses the apiEndpoint override, which breaks real-time entirely
   * (broker answers CONNACK rc=5 Not authorized). Keep it matching the env. */
  apiRegion: ApiRegion;
  defaultApiKey: string;
  uploadUrl: string;
  /** Custom HTTP endpoint override. Required for Staging (custom endpoint).
   * Omit for standard regions — the SDK derives the URL from apiRegion. */
  apiEndpoint?: string;
}

export const REGION_CONFIG: Record<RegionLabel, RegionPreset> = {
  Staging: {
    sdkRegion: SDK_REGION_STAGING || 'staging',
    apiRegion: (API_REGION_STAGING || 'staging') as ApiRegion,
    defaultApiKey: API_KEY_STAGING,
    uploadUrl: UPLOAD_URL_STAGING || 'https://upload.staging.amity.co',
    apiEndpoint: API_ENDPOINT_STAGING || 'https://apix.staging.amity.co',
  },
  SG: {
    sdkRegion: SDK_REGION_SG || 'sg',
    apiRegion: (API_REGION_SG || 'sg') as ApiRegion,
    defaultApiKey: API_KEY_SG,
    uploadUrl: UPLOAD_URL_SG || 'https://upload.sg.amity.co',
    // no apiEndpoint — SDK computes https://apix.sg.amity.co from apiRegion
  },
  EU: {
    sdkRegion: SDK_REGION_EU || 'eu',
    apiRegion: (API_REGION_EU || 'eu') as ApiRegion,
    defaultApiKey: API_KEY_EU,
    uploadUrl: UPLOAD_URL_EU || 'https://upload.eu.amity.co',
  },
  US: {
    sdkRegion: SDK_REGION_US || 'us',
    apiRegion: (API_REGION_US || 'us') as ApiRegion,
    defaultApiKey: API_KEY_US,
    uploadUrl: UPLOAD_URL_US || 'https://upload.us.amity.co',
  },
};

export const REGION_LABELS = Object.keys(REGION_CONFIG) as RegionLabel[];

/** Platform default userId for React Native (spec §1.1 / Platform Differences). */
export const PLATFORM_DEFAULT_USER_ID = 'rn-test';

// ── Shared login config (Screens 1 + 2) ──────────────────────────────────────

export interface LoginConfig {
  // Screen 1 — User
  userId: string;
  displayName: string;
  userType: UserType;
  // Screen 1 — Network
  regionLabel: RegionLabel;
  apiKey: string;
  uploadUrl: string;
  // Screen 2 — Security
  secureMode: boolean;
  /** Server endpoint that issues auth signatures. Shown only when secureMode = ON. (spec §2.2) */
  authSignatureUrl: string;
  authSignatureExpiresAt: Date;
  // Screen 2 — Behaviour
  syncNetworkConfig: boolean;
  // NOTE: visitorCanViewClip is Web/Storybook only (spec §2.4) — not part of the mobile config.
  hideExplore: boolean;
  socialCommunityCreationButtonVisible: boolean;
  // Screen 2 — Appearance
  theme: Theme;
}

const DEFAULT_REGION: RegionLabel = 'Staging';

export const DEFAULT_CONFIG: LoginConfig = {
  userId: PLATFORM_DEFAULT_USER_ID,
  displayName: '',
  userType: 'signed-in',
  regionLabel: DEFAULT_REGION,
  apiKey: REGION_CONFIG[DEFAULT_REGION].defaultApiKey,
  uploadUrl: REGION_CONFIG[DEFAULT_REGION].uploadUrl,
  secureMode: false,
  authSignatureUrl: '',
  authSignatureExpiresAt: new Date(Date.now() + 3600000), // now + 1 hour
  syncNetworkConfig: false,
  hideExplore: false,
  socialCommunityCreationButtonVisible: true,
  theme: 'default',
};
