// AmityForceMode — force light/dark for a subtree (e.g. always-dark surfaces like
// livestream/story). Ports the web's useForceDarkTheme to RN's context model:
// it re-provides the theme with a fixed mode while preserving the parent's config + scope.

import React from 'react';
import {
  AmityThemeProvider,
  useAmityTheme,
  type Mode,
} from './AmityThemeProvider';

export interface AmityForceModeProps {
  mode: Mode;
  children: React.ReactNode;
}

export function AmityForceMode({ mode, children }: AmityForceModeProps) {
  const { scopeId, config } = useAmityTheme();
  return (
    <AmityThemeProvider mode={mode} scopeId={scopeId} config={config}>
      {children}
    </AmityThemeProvider>
  );
}
