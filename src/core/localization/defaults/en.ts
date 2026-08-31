/**
 * UIKit v4 — Default Locale Bundle (Level 4 Library Defaults)
 *
 * The canonical source of all English strings is `en.json` in this directory.
 * This file re-exports them as a typed TypeScript object.
 *
 * To add or update strings: edit `en.json`.
 * To provide translations: pass a locale bundle to AmityUIKitProvider.
 *
 * Key format: amity_{module}_{descriptive_name}
 * Modules: social, common, chat
 */

import bundle from './en.json';

export const defaultLocaleBundle: Record<string, string> = bundle;

// Also expose it as the default export. Metro's `sourceExts` places `json` ahead
// of `ts`, so `from './defaults/en'` resolves to en.json in React Native while
// bundlers on web (and tsc/jest) resolve to this file. A default export is the
// one shape both files share — en.json's default IS the string map — so import
// sites that use a default import work under either resolution.
export default bundle;
