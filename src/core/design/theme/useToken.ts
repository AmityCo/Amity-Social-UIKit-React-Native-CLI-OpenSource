// useToken — the component-facing accessor. Returns a function that maps an
// AmityColorToken to its resolved hex for the active mode + scope.
//
//   const token = useToken();
//   backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault)
//
// A mode can be passed to resolve against that mode instead of the active one.
// That is for a surface whose darkness is a property of the surface rather than
// of the app's theme — a sheet opened over a livestream, say, which is dark on
// a dark page whichever theme the host app runs. Such a surface still belongs
// in the token system; it simply asks a different column of it.

import { useMemo } from 'react';

import { type Mode, type TokenTable } from '../tokens/config-resolver';
import designTokens from '../tokens/amity-uikit-design-tokens.json';
import { useAmityTheme } from './AmityThemeProvider';
import { resolveAllTokens } from './resolveTokens';

const TABLE = designTokens as unknown as TokenTable;

/** Structural type of an AmityColorToken entry (only `.path` is needed to resolve). */
export interface ColorTokenRef {
  path: string;
}

export function useToken(mode?: Mode) {
  const { colors, config, scopeId, mode: activeMode } = useAmityTheme();

  // The active mode is already resolved by the provider; only a request for the
  // other one costs a resolve, and that is memoized.
  const map = useMemo(
    () =>
      !mode || mode === activeMode
        ? colors
        : resolveAllTokens(config, TABLE, mode, scopeId),
    [colors, config, scopeId, mode, activeMode]
  );

  return (token: ColorTokenRef): string => map[token.path];
}
