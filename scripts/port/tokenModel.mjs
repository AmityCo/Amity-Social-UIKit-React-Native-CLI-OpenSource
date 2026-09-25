// Helpers for reading the vendored token model: the AmityColorToken name map
// (amity-color-tokens.ts) and the alias/semantic storage (design-tokens.json).
// Zero-dependency ESM — parses the generated TS with a regex rather than eval.

import { readFileSync } from 'node:fs';

// slug() must match the web's tokenSlug exactly: non-alphanumeric -> '-',
// collapse repeats, trim leading/trailing '-', lowercase.
// e.g. "Surface/Page/Background/Default" -> "surface-page-background-default"
export function slug(name) {
  return String(name)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

// Parse amity-color-tokens.ts -> [{ name, path, defaultLightHex, defaultDarkHex, themeKeyLight, themeKeyDark }]
export function parseColorTokens(tsPath) {
  const src = readFileSync(tsPath, 'utf8');
  const out = [];
  // Match:  TokenName: { path: "A/B/C", defaultLightHex: "#..", ... },
  const re = /^\s*([A-Za-z0-9_]+):\s*\{\s*path:\s*"([^"]+)"([^}]*)\}/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, name, path, rest] = m;
    const pick = (k) => {
      const mm = new RegExp(`${k}:\\s*(?:"([^"]*)"|(null))`).exec(rest);
      return mm ? (mm[2] ? null : mm[1]) : undefined;
    };
    out.push({
      name,
      path,
      defaultLightHex: pick('defaultLightHex'),
      defaultDarkHex: pick('defaultDarkHex'),
      themeKeyLight: pick('themeKeyLight'),
      themeKeyDark: pick('themeKeyDark'),
    });
  }
  return out;
}

export function loadDesignTokens(jsonPath) {
  return JSON.parse(readFileSync(jsonPath, 'utf8'));
}

// Build reverse maps used by the extractor + checker.
export function buildIndexes(colorTokens) {
  const byPath = new Map();
  const bySlug = new Map();
  const nameSet = new Set();
  for (const t of colorTokens) {
    byPath.set(t.path, t);
    bySlug.set(slug(t.path), t);
    nameSet.add(t.name);
  }
  return { byPath, bySlug, nameSet };
}
