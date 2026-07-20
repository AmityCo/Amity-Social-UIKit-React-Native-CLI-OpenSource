#!/usr/bin/env node
// check-web-parity.mjs — DETERMINISTIC completeness check against the WEB source tree.
// Reads the web repo from its LOCAL checkout on disk (expected branch: feat/PDT-3712-chat-dark-theme),
// enumerates the design system + chat tree, then verifies every web unit is accounted for in
// scripts/port/web-parity-map.json and (for 'port' units) has a matching RN file.
// This catches anything web has that we haven't consciously handled — no silent gaps.
//
//   node scripts/check-web-parity.mjs                 # all milestones
//   node scripts/check-web-parity.mjs --milestone=1   # gate just M1
//   node scripts/check-web-parity.mjs --web=/abs/AmityUiKitWeb
//
// Exit 1 if: any web unit is UNACCOUNTED, or any 'port' unit in scope is MISSING its RN file.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT, RN, WEB_ROOT, WEB_BRANCH_EXPECTED, webPath, c } from './port/paths.mjs';

const argVal = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const manifest = JSON.parse(readFileSync(resolve(RN.portDir, 'web-parity-map.json'), 'utf8'));
const milestoneArg = argVal('milestone', '');
const milestone = milestoneArg ? Number(milestoneArg) : null;

// verify web checkout is present (and warn if not on the expected branch)
if (!existsSync(webPath('src/v4/chat'))) {
  console.error(c.red(`\n  Web checkout not found at ${WEB_ROOT} (no src/v4/chat). Pass --web=/abs/path.\n`));
  process.exit(2);
}
try {
  const b = execFileSync('git', ['-C', WEB_ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  if (b !== WEB_BRANCH_EXPECTED) console.log(c.yellow(`  note: web is on '${b}', expected '${WEB_BRANCH_EXPECTED}'`));
} catch { /* not fatal */ }

// Enumerate top-level component units (immediate child that is <Name>.tsx or a dir with <Name>.tsx/index.tsx).
function topUnits(rootRel) {
  const dir = webPath(rootRel);
  if (!existsSync(dir)) return null;
  const set = new Set();
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) {
      if (existsSync(resolve(p, `${name}.tsx`)) || existsSync(resolve(p, 'index.tsx'))) set.add(name);
    } else if (name.endsWith('.tsx')) {
      set.add(name.slice(0, -4));
    }
  }
  return [...set].sort();
}

const inScope = (u) => milestone == null || u.milestone === milestone;
const buckets = { covered: [], missing: [], skip: [], unaccounted: [], drift: [] };

// (a) enumerable roots: enumerate web folder → must be classified in manifest.units
for (const [rootKey, rootRel] of Object.entries(manifest.roots)) {
  const units = topUnits(rootRel);
  if (units == null) { console.log(c.yellow(`  (skip: web root not found: ${rootRel})`)); continue; }
  for (const name of units) {
    const key = `${rootKey}/${name}`;
    const entry = manifest.units[key];
    if (!entry) { buckets.unaccounted.push(key); continue; }
    if (entry.status === 'skip') { buckets.skip.push(key); continue; }
    if (!inScope(entry)) continue;
    if (entry.rn && existsSync(resolve(REPO_ROOT, entry.rn))) buckets.covered.push(key);
    else buckets.missing.push({ key, rn: entry.rn, milestone: entry.milestone });
  }
}

// (b) curated feature-level components: check web source still exists (drift) + rn exists (coverage)
for (const [name, entry] of Object.entries(manifest.curated || {})) {
  if (!existsSync(webPath(entry.web))) buckets.drift.push(`${name} → web source gone: ${entry.web}`);
  if (!inScope(entry)) continue;
  const rnOk = entry.kind === 'hooks-only'
    ? existsSync(resolve(REPO_ROOT, `${entry.rn}.ts`)) || existsSync(resolve(REPO_ROOT, entry.rn))
    : existsSync(resolve(REPO_ROOT, entry.rn));
  if (rnOk) buckets.covered.push(`curated/${name}`);
  else buckets.missing.push({ key: `curated/${name}`, rn: entry.rn, milestone: entry.milestone });
}

// ---- report ----
const scopeLabel = milestone ? `milestone ${milestone}` : 'all milestones';
console.log(c.bold(`\nWeb→RN parity  ${c.dim(`(${scopeLabel}) · local ${WEB_ROOT.replace(REPO_ROOT + '/..', '..')}`)}\n`));
const portInScope = buckets.covered.length + buckets.missing.length;
console.log(`  ${c.green('✓')} covered      ${buckets.covered.length}/${portInScope} port units`);
for (const m of buckets.missing) console.log(`    ${c.red('✗ missing')} ${m.key} ${c.dim('→ ' + (m.rn || '(no rn)') + ` [M${m.milestone}]`)}`);
console.log(`  ${c.dim('–')} skip         ${buckets.skip.length} ${c.dim('(intentionally not ported)')}`);
if (buckets.drift.length) {
  console.log(`  ${c.red('✗')} DRIFT        ${buckets.drift.length} ${c.red('(curated web source moved/removed — update web-parity-map.json)')}`);
  for (const d of buckets.drift) console.log(`      ${d}`);
}
if (buckets.unaccounted.length) {
  console.log(`  ${c.red('✗')} UNACCOUNTED  ${buckets.unaccounted.length} ${c.red('(web has these; not in web-parity-map.json — decide port/skip)')}`);
  for (const u of buckets.unaccounted) console.log(`      ${u}`);
} else {
  console.log(`  ${c.green('✓')} unaccounted  0 ${c.dim('(every web unit is classified)')}`);
}

const failed = buckets.unaccounted.length + buckets.missing.length + buckets.drift.length;
console.log(`\n  ${failed ? c.red(failed + ' issue(s)') : c.green('parity OK')}\n`);
process.exit(failed ? 1 : 0);
