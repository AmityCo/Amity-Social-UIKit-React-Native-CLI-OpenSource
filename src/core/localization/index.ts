/**
 * UIKit v4 Localization — public API barrel
 *
 * String resolution (Levels 2–5):
 *   import { resolveString, setStringOverrides, clearStringOverrides,
 *            setLocaleBundle, clearLocaleBundle } from '~/v4/core/localization';
 *
 * React hook:
 *   import { useString } from '~/v4/core/localization';
 *
 * Provider (wrap your app tree):
 *   import { LocaleProvider, useLocale } from '~/v4/core/localization';
 *
 * Types:
 *   import type { LocaleBundle, FormatArg } from '~/v4/core/localization';
 *
 * Default bundles / locale map (device-language detection):
 *   import { defaultLocaleBundle, thLocaleBundle, defaultLocaleMap } from '~/v4/core/localization';
 */

export {
  resolveString,
  setStringOverrides,
  clearStringOverrides,
  setLocaleBundle,
  clearLocaleBundle,
  applyFormat,
  _resetLocalizationState,
  _getLocalizationState,
} from './resolveString';

export type { LocaleBundle, FormatArg } from './resolveString';

export { LocaleProvider, LocaleContext, useLocale } from './LocaleProvider';
export type { LocaleContextValue, LocaleProviderProps } from './LocaleProvider';

export { useString } from './useString';

// Default imports, then re-export under the public names — keeps the public API
// identical while surviving either resolution of './defaults/en' | './defaults/th'.
export { default as defaultLocaleBundle } from './defaults/en';
export { default as thLocaleBundle } from './defaults/th';
export { defaultLocaleMap } from './defaultLocaleMap';
