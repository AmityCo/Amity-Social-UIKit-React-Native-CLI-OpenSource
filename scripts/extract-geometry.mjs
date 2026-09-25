#!/usr/bin/env node
// extract-geometry.mjs — pull geometry (sizes/spacing/radii/typography) from the web chat
// CSS modules so the RN styles.ts port isn't eyeballed. Reads the LOCAL web checkout.
// Resolves var(--asc-spacing-*) via the vendored spacing scale and rem/em → px (base 16).
//
//   node scripts/extract-geometry.mjs [--web=/abs/AmityUiKitWeb]
//
// Output: scripts/port/geometry.json  ({ <webFile>: [{ selector, prop, raw, px? }] })
//
// Note: values are a GUIDE. RN unit/layout conversion (padding shorthand, gap, box-sizing,
// hover/media-query removal) is still applied by hand during the port.

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { RN, WEB_ROOT, webPath, c } from './port/paths.mjs';

const REM_PX = 16;
const CHAT_DIR = 'src/v4/chat';

if (!existsSync(webPath(CHAT_DIR))) {
  console.error(c.red(`  Web checkout not found at ${WEB_ROOT} (no ${CHAT_DIR}). Pass --web=/abs/path.`));
  process.exit(2);
}

// spacing scale from the vendored spacing.ts (name -> px)
const spacing = {};
if (existsSync(RN.spacingTs)) {
  const src = readFileSync(RN.spacingTs, 'utf8');
  const body = src.slice(src.indexOf('{'), src.indexOf('} as const'));
  for (const m of body.matchAll(/(\w+):\s*(\d+)/g)) spacing[m[1]] = Number(m[2]);
}

const GEOM_PROPS = new Set([
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'gap', 'row-gap', 'column-gap',
  'border-radius', 'border-width', 'border', 'border-top-width', 'border-bottom-width',
  'font-size', 'line-height', 'letter-spacing', 'font-weight',
  'top', 'right', 'bottom', 'left', 'flex', 'flex-basis', 'flex-grow', 'flex-shrink',
]);

// resolve a single CSS token to px when possible (else keep raw)
function resolveToken(tok) {
  const t = tok.trim();
  const sp = /^var\(--asc-spacing-([a-z0-9]+)\)$/.exec(t);
  if (sp) return spacing[sp[1]] != null ? spacing[sp[1]] : t;
  const rem = /^(-?[0-9.]+)(rem|em)$/.exec(t);
  if (rem) return Math.round(Number(rem[1]) * REM_PX * 100) / 100;
  const px = /^(-?[0-9.]+)px$/.exec(t);
  if (px) return Number(px[1]);
  return t; // %, auto, calc(), other var(), keywords
}

// a value may be shorthand ("8px 16px" / "var(--asc-spacing-s2) 0") — resolve each part
function resolveValue(value) {
  const parts = value.trim().split(/\s+(?![^(]*\))/); // split on spaces not inside ()
  const resolved = parts.map(resolveToken);
  const allPx = resolved.every((r) => typeof r === 'number');
  return { raw: value.trim(), px: allPx ? (resolved.length === 1 ? resolved[0] : resolved) : undefined };
}

function cssFiles(absDir, out = []) {
  for (const name of readdirSync(absDir)) {
    const p = resolve(absDir, name);
    if (statSync(p).isDirectory()) cssFiles(p, out);
    else if (name.endsWith('.css')) out.push(p);
  }
  return out;
}

const files = cssFiles(webPath(CHAT_DIR));
const geometry = {};
let ruleCount = 0;

for (const abs of files) {
  const content = readFileSync(abs, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''); // strip comments
  const rel = relative(WEB_ROOT, abs);
  const entries = [];
  // naive block parse: "selector { body }"
  for (const block of content.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = block[1].trim().replace(/\s+/g, ' ');
    for (const decl of block[2].split(';')) {
      const idx = decl.indexOf(':');
      if (idx === -1) continue;
      const prop = decl.slice(0, idx).trim().toLowerCase();
      if (!GEOM_PROPS.has(prop)) continue;
      const { raw, px } = resolveValue(decl.slice(idx + 1));
      entries.push(px !== undefined ? { selector, prop, raw, px } : { selector, prop, raw });
      ruleCount++;
    }
  }
  if (entries.length) geometry[rel] = entries;
}

mkdirSync(RN.portDir, { recursive: true });
writeFileSync(resolve(RN.portDir, 'geometry.json'), JSON.stringify(geometry, null, 2) + '\n', 'utf8');

console.log(`  ${c.green('✓')} scripts/port/geometry.json`);
console.log(
  `\n${c.bold('Scanned')} ${files.length} css files · ${ruleCount} geometry decls · ` +
    `${Object.keys(geometry).length} files · spacing tokens: ${Object.keys(spacing).length}\n`
);
