#!/usr/bin/env node
// sync-geometry.mjs — vendor the SoT design-geometry spec into RN. IDEMPOTENT / re-runnable.
// Source: cleverden uikit/uikit.tokens.json — the Figma-derived, structured per-component
// geometry (sizes, padding, radius, gaps, type metrics). This is the AUTHORITY for geometry
// (the guide: "never eyeball; they're from the Figma node"). Colour/config are excluded
// (owned by the colour-token system); everything else (component geometry + layout +
// typography + elevation) is vendored as the geometry spec.
//
//   node scripts/sync-geometry.mjs [--sot=/path/to/cleverden]
//
// Output: src/core/design/tokens/geometry.json  (SoT geometry, per component)

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { SOT, RN, REPO_ROOT, assertSot, c } from './port/paths.mjs';

assertSot();
if (!existsSync(SOT.tokensRaw)) {
  console.error(c.red(`  MISSING SoT source: ${SOT.tokensRaw}`));
  process.exit(2);
}

const raw = JSON.parse(readFileSync(SOT.tokensRaw, 'utf8'));

// Exclude foundations already owned elsewhere / not geometry.
const EXCLUDE = new Set(['$meta', 'colors', 'config']);
const geometry = {};
for (const key of Object.keys(raw)) {
  if (EXCLUDE.has(key)) continue;
  geometry[key] = raw[key];
}

writeFileSync(RN.geometryJson, JSON.stringify(geometry, null, 2) + '\n', 'utf8');

const componentKeys = Object.keys(geometry).filter(
  (k) => !['layout', 'typography', 'elevation', 'breakpoint'].includes(k)
);
console.log(`  ${c.green('✓')} ${relative(REPO_ROOT, RN.geometryJson)}`);
console.log(
  `\n${c.bold('Vendored')} SoT geometry · ${Object.keys(geometry).length} keys · ` +
    `${componentKeys.length} component specs (avatarIcon, badges, divider, lists, button …)\n`
);
