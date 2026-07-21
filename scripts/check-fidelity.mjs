#!/usr/bin/env node
// check-fidelity.mjs — DETERMINISTIC "is the RN port faithful to web?" check.
// parity checks a unit EXISTS; wiring checks it is REACHABLE; this checks the RN port
// actually uses the same COLOURS and STRINGS the WEB component uses — catching the
// class of bug where a hand-written/simplified port drops a web colour or label
// (e.g. the see-more divider/label colours, mention colour, edited caption).
//
// For each web↔RN component pair (from web-parity-map.json), it collects:
//   • web colours  — every `--asc-color-<slug>` in the web component's *.module.css
//   • web strings  — every useString/resolveString key in the web *.tsx
// and compares against the RN port's AmityColorToken refs (mapped to slugs) and
// useString keys. A web colour/string missing from RN is a fidelity gap.
//
//   node scripts/check-fidelity.mjs                # all mapped components
//   node scripts/check-fidelity.mjs --milestone=2
//   node scripts/check-fidelity.mjs --unit=features/shared/components/MessageBubble
//
// Exit 1 on any gap not in the allowlist.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { REPO_ROOT, RN, WEB_ROOT, webPath, c, hasFlag } from './port/paths.mjs';
import { parseColorTokens, slug } from './port/tokenModel.mjs';

const argVal = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const milestone = argVal('milestone', '') ? Number(argVal('milestone', '')) : null;
const onlyUnit = argVal('unit', '');
const manifest = JSON.parse(readFileSync(resolve(RN.portDir, 'web-parity-map.json'), 'utf8'));

// Colour slugs web legitimately uses but RN has no 1:1 token for (documented
// substitutions) — keep this list tight and reasoned, never a dumping ground.
const COLOR_ALLOW = new Set([
  'message-overlay', // no RN token; media scrim substituted
  'background-transparent-black', // no RN token; substituted
  'white', // web --asc-color-white; RN uses an equivalent semantic token
]);

const tokens = parseColorTokens(RN.colorTokensTs);
const pathBySlug = new Map(tokens.map((t) => [slug(t.path), t]));
const nameToSlug = new Map(tokens.map((t) => [t.name, slug(t.path)]));

function walk(dir, test, out = []) {
  if (!existsSync(dir)) return out;
  const s = statSync(dir);
  if (s.isFile()) { if (test(dir)) out.push(dir); return out; }
  for (const n of readdirSync(dir)) walk(resolve(dir, n), test, out);
  return out;
}
const readAll = (files) => files.map((f) => readFileSync(f, 'utf8')).join('\n');

// --- Relative-import walker (same model as check-wiring.mjs) ---------------
// A web colour/string counts as "used by the RN port" if it appears in the
// component's own file/subtree OR in any file that component transitively
// imports (via a relative path). This is what tells a legit reorganisation
// (member actions → the AmityGroupMemberActionComponent that MemberList imports)
// apart from a genuine drop (BannedEmptyState never referencing the emptystate
// tokens, even though some *unrelated* empty state does).
function resolveImport(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  return [base, `${base}.tsx`, `${base}.ts`, resolve(base, 'index.tsx'), resolve(base, 'index.ts')]
    .find((p) => existsSync(p) && statSync(p).isFile());
}
const IMPORT_RE = /(?:from|import|require\()\s*['"](\.[^'"]+)['"]/g;
function reachableFrom(entries) {
  const seen = new Set();
  const queue = [...entries];
  while (queue.length) {
    const file = queue.shift();
    if (!file || seen.has(file)) continue;
    seen.add(file);
    let src;
    try { src = readFileSync(file, 'utf8'); } catch { continue; }
    for (const m of src.matchAll(IMPORT_RE)) {
      const dep = resolveImport(file, m[1]);
      if (dep && !seen.has(dep)) queue.push(dep);
    }
  }
  return seen;
}
// Concrete entry files for an RN target (a dir or a bare path).
function rnEntryFiles(rnRel) {
  const abs = resolve(REPO_ROOT, rnRel);
  const out = [];
  for (const p of [resolve(abs, 'index.tsx'), resolve(abs, 'index.ts'), `${abs}.tsx`, `${abs}.ts`])
    if (existsSync(p)) out.push(p);
  // also seed the whole own subtree so a component with no barrel is still covered
  for (const f of walk(existsSync(abs) && statSync(abs).isDirectory() ? abs : abs, (x) => /\.tsx?$/.test(x)))
    out.push(f);
  return [...new Set(out)];
}

// web colour slugs in a component dir's CSS
function webColors(dir) {
  const css = readAll(walk(dir, (f) => f.endsWith('.module.css')));
  return new Set([...css.matchAll(/--asc-color-([a-z0-9-]+)/g)].map((m) => m[1]));
}
// web string keys in a component dir's tsx
function webStrings(dir) {
  const src = readAll(walk(dir, (f) => /\.tsx?$/.test(f)));
  return new Set(
    [...src.matchAll(/(?:useString|resolveString)\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
  );
}
// RN colour slugs + string keys reachable from an RN target (own subtree +
// transitive relative imports).
function rnReach(rnRel) {
  const files = reachableFrom(rnEntryFiles(rnRel));
  const colors = new Set(), strings = new Set();
  for (const f of files) {
    let src;
    try { src = readFileSync(f, 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/AmityColorToken\.([A-Za-z0-9_]+)/g))
      if (nameToSlug.has(m[1])) colors.add(nameToSlug.get(m[1]));
    for (const m of src.matchAll(/(?:useString|resolveString)\(\s*['"]([^'"]+)['"]/g)) strings.add(m[1]);
  }
  return { colors, strings };
}

// Build the web↔RN pairs from the manifest (features + curated), with web dirs.
const pairs = [];
for (const [key, u] of Object.entries(manifest.features || {})) {
  if (u.status && u.status !== 'port') continue;
  if (!u.rn) continue;
  pairs.push({ key, rn: u.rn, web: webPath(`src/v4/chat/${key}`), milestone: u.milestone });
}
for (const [name, u] of Object.entries(manifest.curated || {})) {
  if (!u.rn || !u.web) continue;
  // Some curated RN files (the *ActionComponent bottom-sheet wrappers) have no 1:1
  // web dir — web spreads that logic across a whole feature tree. Fidelity at
  // component granularity is meaningless for them; the granular features/** pairs
  // already cover those colours/strings. Skip (flagged in the manifest).
  if (u.skipFidelity) continue;
  pairs.push({ key: `curated/${name}`, rn: u.rn, web: webPath(u.web), milestone: u.milestone });
}

const inScope = (p) =>
  (milestone == null || p.milestone === milestone) && (!onlyUnit || p.key === onlyUnit);

// Global RN index — every AmityColorToken slug + useString key used ANYWHERE in the
// ported chat feature + design system. Lets us tell a genuine DROP ("web uses this
// colour/string but RN uses it nowhere") from mere reorganisation ("RN uses it, just
// in a different file than web put it"). Only genuine drops hard-fail.
const RN_INDEX_ROOTS = [
  resolve(REPO_ROOT, 'src/social/features/chat'),
  resolve(REPO_ROOT, 'src/core/design'),
];
const rnAllColors = new Set();
const rnAllStrings = new Set();
for (const root of RN_INDEX_ROOTS) {
  for (const f of walk(root, (x) => /\.tsx?$/.test(x))) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/AmityColorToken\.([A-Za-z0-9_]+)/g))
      if (nameToSlug.has(m[1])) rnAllColors.add(nameToSlug.get(m[1]));
    for (const m of src.matchAll(/(?:useString|resolveString)\(\s*['"]([^'"]+)['"]/g)) rnAllStrings.add(m[1]);
  }
}

const rnExists = (rnRel) => {
  const abs = resolve(REPO_ROOT, rnRel);
  return existsSync(abs) || existsSync(`${abs}.tsx`) || existsSync(`${abs}.ts`);
};

const gaps = [];
let checked = 0;
let unbuilt = 0;
for (const p of pairs.filter(inScope)) {
  if (!existsSync(p.web)) continue; // web source moved → drift gate owns it
  if (!rnExists(p.rn)) { unbuilt++; continue; } // not ported yet → parity gate owns it
  checked++;
  const wc = webColors(p.web), ws = webStrings(p.web);
  const { colors: rc, strings: rs } = rnReach(p.rn);
  // A miss = web uses it but it is NOT reachable from this RN component.
  const missColors = [...wc].filter((s) => !rc.has(s) && !COLOR_ALLOW.has(s));
  const missStrings = [...ws].filter((s) => !rs.has(s));
  if (!missColors.length && !missStrings.length) continue;
  // Triage hint (does NOT change pass/fail): `nowhere` = never ported anywhere in
  // RN; `elsewhere` = ported, but in a component this one doesn't reach → likely a
  // wrong-token/placement bug or a missing wire. Both fail.
  const tag = (arr, idx) => arr.map((s) => ({ s, where: idx.has(s) ? 'elsewhere' : 'nowhere' }));
  gaps.push({
    key: p.key,
    colors: tag(missColors, rnAllColors),
    strings: tag(missStrings, rnAllStrings),
  });
}
const hardGaps = gaps; // every gap is a real drop under import-scoping

// Render a tagged miss list; `elsewhere` (ported but this component can't reach it)
// is dimmed with a marker, `nowhere` (never ported) is plain — both fail.
const fmt = (items) =>
  items.map((i) => (i.where === 'elsewhere' ? c.dim(`${i.s}†`) : i.s)).join(', ');

console.log(c.bold(`\nWeb→RN fidelity  ${c.dim(`(${milestone ? 'M' + milestone : 'all'}) · ${checked} components`)}\n`));
if (!gaps.length) {
  console.log(`  ${c.green('✓')} every checked component uses all its web colours + strings (import-scoped)\n`);
  process.exit(0);
}
console.log(c.dim('  A web colour/string is a gap when the RN component (its own files + everything\n' +
  '  it imports) never references it. † = ported elsewhere in RN but unreachable from\n' +
  '  here (wrong token / missing wire); no dagger = never ported anywhere.\n'));
for (const g of gaps) {
  console.log(`  ${c.red('✗')} ${g.key}`);
  if (g.colors.length) console.log(`      colours: ${fmt(g.colors)}`);
  if (g.strings.length) console.log(`      strings: ${fmt(g.strings)}`);
}
console.log(`\n  ${c.red(gaps.length + ' component(s) with fidelity gaps')}\n`);
process.exit(1);
