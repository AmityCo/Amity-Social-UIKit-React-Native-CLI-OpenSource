// Pure, framework-free core of the theming layer — extracted so it can be unit-tested
// without a React renderer. AmityThemeProvider is a thin wrapper over these functions.

import {
  resolveToken,
  backfillThemeDefaults,
  type Mode,
  type TokenConfig,
  type TokenTable,
} from '../tokens/config-resolver';
import { AmityColorToken } from '../tokens/amity-color-tokens';

/** Resolved colours keyed by the semantic token path (e.g. "Surface/Page/Background/Default"). */
export type ColorMap = Record<string, string>;

export type PreferredTheme = 'light' | 'dark' | 'default';

/** Eagerly resolve every AmityColorToken to a concrete hex for the mode + scope. */
export function resolveAllTokens(
  config: TokenConfig,
  table: TokenTable,
  mode: Mode,
  scopeId: string
): ColorMap {
  const out: ColorMap = {};
  for (const key of Object.keys(AmityColorToken)) {
    const { path } = AmityColorToken[key as keyof typeof AmityColorToken];
    out[path] = resolveToken(config, table, scopeId, mode, path).value;
  }
  return out;
}

/** Derive the active mode. Explicit `mode` wins; else `preferredTheme`; else the OS scheme. */
export function deriveMode(opts: {
  mode?: Mode;
  preferredTheme?: PreferredTheme;
  /** Accepts react-native's ColorSchemeName ('light' | 'dark' | null | undefined). */
  scheme?: string | null;
}): Mode {
  const { mode, preferredTheme = 'default', scheme } = opts;
  if (mode) return mode;
  if (preferredTheme === 'dark') return 'dark';
  if (preferredTheme === 'light') return 'light';
  return scheme === 'dark' ? 'dark' : 'light';
}

/** Base config, with optional (partial) customer overrides backfilled on top. */
export function effectiveConfig(
  base: TokenConfig,
  customer?: TokenConfig
): TokenConfig {
  return customer ? backfillThemeDefaults(customer, base) : base;
}
