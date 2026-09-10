#!/usr/bin/env node
// extract-token-usage.mjs — reverse-map the web chat's CSS-variable token usage back to
// AmityColorToken names, per source file. Reads the LOCAL web checkout (no git).
//
// The web binds colors as `var(--asc-color-<slug>)` in .module.css. The slug is the semantic
// path lowercased with non-alphanumerics -> '-'. We invert that so the manual RN styles.ts
// rewrites reference the correct token — no color guessed.
//
//   node scripts/extract-token-usage.mjs [--web=/abs/AmityUiKitWeb]
//
// Output: scripts/port/token-usage.json  ({ <webFile>: [tokenName, ...] })

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { RN, WEB_ROOT, webPath, c } from './port/paths.mjs';
import { parseColorTokens, buildIndexes } from './port/tokenModel.mjs';

const CHAT_DIR = 'src/v4/chat';

if (!existsSync(RN.colorTokensTs)) {
  console.error(c.red('  Run sync-design-tokens.mjs first (need amity-color-tokens.ts to reverse-map).'));
  process.exit(2);
}
if (!existsSync(webPath(CHAT_DIR))) {
  console.error(c.red(`  Web checkout not found at ${WEB_ROOT} (no ${CHAT_DIR}). Pass --web=/abs/path.`));
  process.exit(2);
}

const { bySlug } = buildIndexes(parseColorTokens(RN.colorTokensTs));

// recursively collect .css files under the local web chat dir
function cssFiles(absDir, out = []) {
  for (const name of readdirSync(absDir)) {
    const p = resolve(absDir, name);
    if (statSync(p).isDirectory()) cssFiles(p, out);
    else if (name.endsWith('.css')) out.push(p);
  }
  return out;
}

const SLUG_RE = /--asc-color-([a-z0-9-]+)/g;
const usage = {};
const unmatched = new Set();
let totalRefs = 0;
const files = cssFiles(webPath(CHAT_DIR));

for (const abs of files) {
  const content = readFileSync(abs, 'utf8');
  const rel = relative(WEB_ROOT, abs); // web-relative key, e.g. src/v4/chat/.../X.module.css
  const names = new Set();
  let m;
  while ((m = SLUG_RE.exec(content)) !== null) {
    totalRefs++;
    const tok = bySlug.get(m[1]);
    if (tok) names.add(tok.name);
    else unmatched.add(m[1]);
  }
  if (names.size) usage[rel] = [...names].sort();
}

mkdirSync(RN.portDir, { recursive: true });
writeFileSync(resolve(RN.portDir, 'token-usage.json'), JSON.stringify(usage, null, 2) + '\n', 'utf8');

console.log(`  ${c.green('✓')} scripts/port/token-usage.json`);
console.log(
  `\n${c.bold('Scanned')} ${files.length} css files · ${totalRefs} refs · ` +
    `${Object.keys(usage).length} files mapped · ${unmatched.size} unmatched slugs (legacy --asc-color-*)\n`
);
