#!/usr/bin/env node
// check-web-parity.mjs — DETERMINISTIC completeness check against the WEB source tree.
// Reads the web repo from its LOCAL checkout on disk (expected branch: feat/PDT-3712-chat-dark-theme),
// enumerates the design system + chat tree, then verifies every web unit is accounted for in
// scripts/port/web-parity-map.json and (for 'port' units) has a matching RN file.
// This catches anything web has that we haven't consciously handled — no silent gaps.
//
//   node scripts/check-web-parity.mjs                     # all milestones
//   node scripts/check-web-parity.mjs --milestone=1       # gate just M1
//   node scripts/check-web-parity.mjs --milestone=1 --no-stubs   # also fail on unfinished stubs
//   node scripts/check-web-parity.mjs --web=/abs/AmityUiKitWeb
//
// Exit 1 if: any web unit is UNACCOUNTED, MISSING its RN file, DRIFTed, or (with --no-stubs)
// still contains a PORT STUB / TODO(port) marker (i.e. scaffolded but not actually ported).

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT, RN, WEB_ROOT, WEB_BRANCH_EXPECTED, webPath, c, hasFlag } from './port/paths.mjs';

const argVal = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const manifest = JSON.parse(readFileSync(resolve(RN.portDir, 'web-parity-map.json'), 'utf8'));
const milestoneArg = argVal('milestone', '');
const milestone = milestoneArg ? Number(milestoneArg) : null;
const noStubs = hasFlag('--no-stubs');

const STUB_RE = /PORT STUB|TODO\(port\)/;
function collectTs(abs, out = []) {
  if (!existsSync(abs)) return out;
  if (statSync(abs).isFile()) { if (/\.[jt]sx?$/.test(abs)) out.push(abs); return out; }
  for (const name of readdirSync(abs)) collectTs(resolve(abs, name), out);
  return out;
}
/** True if the RN target exists — as a dir, or a single .tsx/.ts file at that path. */
function rnExists(rnRel) {
  const abs = resolve(REPO_ROOT, rnRel);
  return existsSync(abs) || existsSync(`${abs}.tsx`) || existsSync(`${abs}.ts`);
}

/** True if the RN target still carries an unfinished stub marker. */
function isStub(rnRel, kind) {
  const abs = resolve(REPO_ROOT, rnRel);
  const files =
    kind === 'hooks-only' && existsSync(`${abs}.ts`) ? [`${abs}.ts`] : collectTs(abs);
  return files.length > 0 && files.some((f) => STUB_RE.test(readFileSync(f, 'utf8')));
}

// verify web checkout is present (and warn if not on the expected branch)
if (!existsSync(webPath('src/v4/chat'))) {
  console.error(c.red(`\n  Web checkout not found at ${WEB_ROOT} (no src/v4/chat). Pass --web=/abs/path.\n`));
  process.exit(2);
}
try {
  const b = execFileSync('git', ['-C', WEB_ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  if (b !== WEB_BRANCH_EXPECTED) console.log(c.yellow(`  note: web is on '${b}', expected '${WEB_BRANCH_EXPECTED}'`));
} catch { /* not fatal */ }

// Recursively enumerate every component unit under the feature tree. A unit is a
// PascalCase <Name>.tsx (not index). Key = path from src/v4/chat/ minus .tsx, with the
// duplicate leaf filename collapsed for own-dir components (MessageRow/MessageRow →
// features/shared/components/MessageRow) but kept for feature entries whose file name
// differs from its dir (conversation/chat/Chat → features/conversation/chat/Chat).
function featureUnits() {
  const base = webPath('src/v4/chat');
  const featBase = resolve(base, manifest.featureRoot.replace(/^src\/v4\/chat\//, ''));
  if (!existsSync(featBase)) return [];
  const out = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = resolve(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.tsx') && /^[A-Z]/.test(name) && name !== 'index.tsx') {
        const rel = p.slice(base.length + 1).replace(/\.tsx$/, '');
        const parts = rel.split('/');
        const stem = parts[parts.length - 1];
        const dirbase = parts[parts.length - 2];
        out.push(dirbase === stem ? parts.slice(0, -1).join('/') : rel);
      }
    }
  })(featBase);
  return [...new Set(out)].sort();
}

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
const buckets = { covered: [], missing: [], stubbed: [], skip: [], unaccounted: [], drift: [] };

// route a present RN target to covered or (with --no-stubs) stubbed
function classifyPresent(key, rnRel, kind) {
  if (noStubs && isStub(rnRel, kind)) buckets.stubbed.push(key);
  else buckets.covered.push(key);
}

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
    if (entry.rn && rnExists(entry.rn)) classifyPresent(key, entry.rn);
    else buckets.missing.push({ key, rn: entry.rn, milestone: entry.milestone });
  }
}

// (a2) feature tree: recursively enumerate the whole chat/features/** component tree.
// Every unit must be classified in manifest.features (port/skip + milestone) or it is
// UNACCOUNTED — this is what stops feature "abilities" being silently missed.
if (manifest.featureRoot && manifest.features) {
  for (const key of featureUnits()) {
    const entry = manifest.features[key];
    if (!entry) { buckets.unaccounted.push(key); continue; }
    if (entry.status === 'skip') { buckets.skip.push(key); continue; }
    if (!inScope(entry)) continue;
    if (entry.rn && rnExists(entry.rn)) classifyPresent(key, entry.rn, entry.kind);
    else buckets.missing.push({ key, rn: entry.rn, milestone: entry.milestone });
  }
}

// (b) curated feature-level components: check web source still exists (drift) + rn exists (coverage)
for (const [name, entry] of Object.entries(manifest.curated || {})) {
  if (!existsSync(webPath(entry.web))) buckets.drift.push(`${name} → web source gone: ${entry.web}`);
  if (!inScope(entry)) continue;
  const rnOk = entry.kind === 'hooks-only'
    ? existsSync(resolve(REPO_ROOT, `${entry.rn}.ts`)) || existsSync(resolve(REPO_ROOT, entry.rn))
    : rnExists(entry.rn);
  if (rnOk) classifyPresent(`curated/${name}`, entry.rn, entry.kind);
  else buckets.missing.push({ key: `curated/${name}`, rn: entry.rn, milestone: entry.milestone });
}

// ---- report ----
const scopeLabel = milestone ? `milestone ${milestone}` : 'all milestones';
console.log(c.bold(`\nWeb→RN parity  ${c.dim(`(${scopeLabel}) · local ${WEB_ROOT.replace(REPO_ROOT + '/..', '..')}`)}\n`));
const portInScope = buckets.covered.length + buckets.missing.length + buckets.stubbed.length;
console.log(`  ${c.green('✓')} covered      ${buckets.covered.length}/${portInScope} port units`);
for (const m of buckets.missing) console.log(`    ${c.red('✗ missing')} ${m.key} ${c.dim('→ ' + (m.rn || '(no rn)') + ` [M${m.milestone}]`)}`);
if (noStubs) {
  console.log(`  ${buckets.stubbed.length ? c.red('✗') : c.green('✓')} stubbed      ${buckets.stubbed.length} ${c.dim('(scaffolded but PORT STUB/TODO still present)')}`);
  for (const s of buckets.stubbed) console.log(`      ${c.red(s)}`);
}
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

const failed =
  buckets.unaccounted.length +
  buckets.missing.length +
  buckets.drift.length +
  buckets.stubbed.length;
console.log(`\n  ${failed ? c.red(failed + ' issue(s)') : c.green('parity OK')}\n`);
process.exit(failed ? 1 : 0);
