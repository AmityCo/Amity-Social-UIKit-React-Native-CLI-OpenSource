// AmityThemeProvider — resolves all design tokens to concrete colours for the active
// mode + scope and provides them via context. RN has no CSS variables, so we eagerly
// flatten every token (semantic → alias → theme key → hex) using the vendored
// config-resolver.js. Mode is config-driven (not the OS setting), per the guide.
// The pure resolution/mode logic lives in ./resolveTokens (unit-tested).

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  type Mode,
  type TokenConfig,
  type TokenTable,
} from '../tokens/config-resolver';
import designTokens from '../tokens/amity-uikit-design-tokens.json';
import baseConfig from '../tokens/amity-uikit-config.json';
import {
  resolveAllTokens,
  deriveMode,
  effectiveConfig,
  type ColorMap,
  type PreferredTheme,
} from './resolveTokens';

const TABLE = designTokens as unknown as TokenTable;
const BASE_CONFIG = baseConfig as unknown as TokenConfig;

export interface AmityThemeContextValue {
  mode: Mode;
  scopeId: string;
  colors: ColorMap;
  /** The effective config (base + customer overrides), for nested providers. */
  config: TokenConfig;
}

const AmityThemeContext = createContext<AmityThemeContextValue | null>(null);

export interface AmityThemeProviderProps {
  children: React.ReactNode;
  /** Explicit mode override (wins over preferredTheme). */
  mode?: Mode;
  /** Config-driven theme: 'default' follows the OS colour scheme. */
  preferredTheme?: PreferredTheme;
  /** Customer overrides (partial); backfilled from the bundled base config. */
  config?: TokenConfig;
  /** Scope for the customization cascade; default global. */
  scopeId?: string;
}

export function AmityThemeProvider({
  children,
  mode: modeProp,
  preferredTheme = 'default',
  config,
  scopeId = '*/*/*',
}: AmityThemeProviderProps) {
  const scheme = useColorScheme();
  const mode = deriveMode({ mode: modeProp, preferredTheme, scheme });

  const value = useMemo<AmityThemeContextValue>(() => {
    const effective = effectiveConfig(BASE_CONFIG, config);
    return {
      mode,
      scopeId,
      config: effective,
      colors: resolveAllTokens(effective, TABLE, mode, scopeId),
    };
  }, [mode, scopeId, config]);

  return (
    <AmityThemeContext.Provider value={value}>
      {children}
    </AmityThemeContext.Provider>
  );
}

export function useAmityTheme(): AmityThemeContextValue {
  const ctx = useContext(AmityThemeContext);
  if (!ctx) {
    throw new Error('useAmityTheme must be used within an AmityThemeProvider');
  }
  return ctx;
}

export { AmityThemeContext };
export type { Mode, ColorMap, PreferredTheme };
