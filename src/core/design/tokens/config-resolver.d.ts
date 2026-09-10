// Hand-written types for the vendored (JS) config-resolver.js.
// The .js is synced verbatim from cleverden; this declaration is the RN/TS contract.

export type Mode = 'light' | 'dark';

export interface ResolvedValue {
  /** Resolved colour, always uppercased 6/8-digit hex (or #FF00FF when missing). */
  value: string;
  /** How it resolved, e.g. "theme:background_color@global" | "literal" | "missing". */
  source: string;
}

export interface TokenConfig {
  theme: Record<Mode, Record<string, string>>;
  customizations?: Record<
    string,
    { theme?: Partial<Record<Mode, Record<string, string>>> }
  >;
  [key: string]: unknown;
}

export interface TokenTable {
  alias: Record<string, string>;
  semantic: Record<string, { light?: string; dark?: string }>;
}

/** Resolve a semantic token path to a hex for the given scope + mode. */
export function resolveToken(
  config: TokenConfig,
  table: TokenTable,
  scopeId: string | null,
  mode: Mode,
  tokenPath: string
): ResolvedValue;

/** Fill theme keys missing from a partial customer config from bundled defaults (pure, customer wins). */
export function backfillThemeDefaults(
  config: TokenConfig,
  defaults: TokenConfig
): TokenConfig;

export function resolveThemeKey(
  config: TokenConfig,
  scopeId: string | null,
  mode: Mode,
  key: string
): { value: string | null; source: string };

export function resolveTheme12(
  config: TokenConfig,
  scopeId: string,
  mode: Mode
): Record<string, { value: string | null; source: string }>;

export function runSelfTest(): unknown;
