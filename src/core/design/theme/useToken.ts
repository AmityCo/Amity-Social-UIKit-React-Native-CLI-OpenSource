// useToken — the component-facing accessor. Returns a function that maps an
// AmityColorToken to its resolved hex for the active mode + scope.
//
//   const token = useToken();
//   backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault)

import { useAmityTheme } from './AmityThemeProvider';

/** Structural type of an AmityColorToken entry (only `.path` is needed to resolve). */
export interface ColorTokenRef {
  path: string;
}

export function useToken() {
  const { colors } = useAmityTheme();
  return (token: ColorTokenRef): string => colors[token.path];
}
