// Shared path/config resolution for the chat + design-token porting scripts.
// Zero-dependency ESM. All scripts import from here so the SoT location and the
// RN destination layout are defined in exactly one place.

import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Repo root = two levels up from scripts/port/
export const REPO_ROOT = resolve(__dirname, '..', '..');

// --- SoT (cleverden) location -------------------------------------------------
// Priority: --sot=<path> arg  >  AMITY_SOT env  >  sibling ../cleverden default.
function resolveSot() {
  const arg = process.argv.find((a) => a.startsWith('--sot='));
  if (arg) return resolve(process.cwd(), arg.slice('--sot='.length));
  if (process.env.AMITY_SOT) return resolve(process.env.AMITY_SOT);
  return resolve(REPO_ROOT, '..', 'cleverden');
}

export const SOT_ROOT = resolveSot();

// --- Web UIKit (port source) — read from the LOCAL checkout ---------------------
// The web repo is expected to be checked out to the chat branch on disk, so scripts
// read files directly from the filesystem (no `git show`). Override with --web / AMITY_WEB.
function resolveWeb() {
  const arg = process.argv.find((a) => a.startsWith('--web='));
  if (arg) return resolve(process.cwd(), arg.slice('--web='.length));
  if (process.env.AMITY_WEB) return resolve(process.env.AMITY_WEB);
  return resolve(REPO_ROOT, '..', 'AmityUiKitWeb');
}
export const WEB_ROOT = resolveWeb();
export const WEB_BRANCH_EXPECTED = 'feat/PDT-3712-chat-dark-theme';
export const webPath = (rel) => resolve(WEB_ROOT, rel);

// --- SoT source files (the theming contract + assets) -------------------------
// Resolution uses config-resolver.js (the guide's mandated resolver, reused directly on RN)
// fed with the config template (amity-uikit-config.json, 49-key atomic palette) as the base
// config → resolves all 717 tokens to web-matching hex. amity-color-tokens.ts is vendored for
// the AmityColorToken.X vocabulary (names + semantic paths) — its baked defaultHex values are
// NOT used at runtime (they diverge from web/config-template; see the drift note in the plan).
// The FE-consumed package (front-end-tech-specs/UIKIT/tokens/) carries the config template.
const TOKENS_PKG = resolve(SOT_ROOT, 'front-end-tech-specs/UIKIT/tokens');
export const SOT = {
  resolver: resolve(SOT_ROOT, 'uikit/config-resolver.js'), // the resolver (semantic→alias→theme→hex)
  tokensJson: resolve(SOT_ROOT, 'uikit/amity-uikit-design-tokens.json'), // alias/semantic table
  configTemplate: resolve(TOKENS_PKG, 'amity-uikit-config.json'), // 49-key palette = base config (matches web)
  colorTokensTs: resolve(TOKENS_PKG, 'generated/amity-color-tokens.ts'), // AmityColorToken vocabulary (names+paths)
  checksums: resolve(TOKENS_PKG, 'generated/CHECKSUMS.json'),
  iconsDir: resolve(SOT_ROOT, 'uikit/assets/icons'),
  tokensRaw: resolve(SOT_ROOT, 'uikit/uikit.tokens.json'), // /layout/spacing (px) etc.
};

// --- RN destination layout ----------------------------------------------------
export const RN = {
  tokensDir: resolve(REPO_ROOT, 'src/core/design/tokens'),
  tokensJson: resolve(REPO_ROOT, 'src/core/design/tokens/amity-uikit-design-tokens.json'),
  resolver: resolve(REPO_ROOT, 'src/core/design/tokens/config-resolver.js'),
  configTemplate: resolve(REPO_ROOT, 'src/core/design/tokens/amity-uikit-config.json'),
  colorTokensTs: resolve(REPO_ROOT, 'src/core/design/tokens/amity-color-tokens.ts'),
  spacingTs: resolve(REPO_ROOT, 'src/core/design/tokens/spacing.ts'),
  geometryJson: resolve(REPO_ROOT, 'src/core/design/tokens/geometry.json'),
  checksums: resolve(REPO_ROOT, 'src/core/design/tokens/CHECKSUMS.json'),
  localizationDir: resolve(REPO_ROOT, 'src/core/localization'),
  localeEnJson: resolve(REPO_ROOT, 'src/core/localization/defaults/en.json'),
  iconRegistry: resolve(REPO_ROOT, 'src/core/design/icons/generated/iconRegistry.ts'),
  chatFeatureDir: resolve(REPO_ROOT, 'src/social/features/chat'),
  designAtomsDir: resolve(REPO_ROOT, 'src/core/design/atoms'),
  // Whole design system (atoms/molecules/components/elements) — for hex/token scans.
  // Excludes tokens/ + icons/generated/ (vendored) via the caller's walk.
  designDir: resolve(REPO_ROOT, 'src/core/design'),
  portDir: resolve(REPO_ROOT, 'scripts/port'),
};

export function assertSot() {
  if (!existsSync(SOT.tokensJson)) {
    console.error(
      `\n[port] Could not find the SoT (cleverden) at:\n  ${SOT_ROOT}\n\n` +
        `Pass --sot=/abs/path/to/cleverden or set AMITY_SOT.\n`
    );
    process.exit(2);
  }
}

// tiny ansi helpers (no dependency)
export const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

export const hasFlag = (f) => process.argv.includes(f);
