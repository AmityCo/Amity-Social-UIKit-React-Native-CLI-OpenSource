#!/usr/bin/env node
// check-wiring.mjs — DETERMINISTIC "is it actually wired?" check.
// The parity gate proves a port unit's RN file EXISTS; it does not prove the file is
// reachable from a screen. This walks the relative-import graph from the chat page
// entry points and reports any 'port' unit whose RN file nothing imports — i.e.
// built-but-unwired components that would be invisible in the app.
//
//   node scripts/check-wiring.mjs                 # all milestones
//   node scripts/check-wiring.mjs --milestone=2   # only M2 units
//
// Exit 1 if any in-scope port unit is unreachable.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { REPO_ROOT, RN, c } from './port/paths.mjs';

const argVal = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const milestone = argVal('milestone', '') ? Number(argVal('milestone', '')) : null;
const manifest = JSON.parse(readFileSync(resolve(RN.portDir, 'web-parity-map.json'), 'utf8'));

// Resolve a relative import spec from an importer file to a concrete file path.
function resolveImport(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  const cands = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    resolve(base, 'index.tsx'),
    resolve(base, 'index.ts'),
  ];
  return cands.find((p) => existsSync(p) && statSync(p).isFile());
}

const IMPORT_RE = /(?:from|import|require\()\s*['"](\.[^'"]+)['"]/g;

// BFS the relative-import graph from the entry files.
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

// Entry points = the chat page components (nav destinations).
const entries = [];
for (const [key, u] of Object.entries(manifest.units)) {
  if (!key.startsWith('chat/pages/') || u.status !== 'port' || !u.rn) continue;
  const f = resolveImport(resolve(REPO_ROOT, u.rn), '.') // dir/index
    || [`${resolve(REPO_ROOT, u.rn)}.tsx`, resolve(REPO_ROOT, u.rn, 'index.tsx')].find(existsSync);
  if (f) entries.push(f);
}
const reachable = reachableFrom(entries);

// Does any file under an RN target participate in the reachable graph?
function isWired(rnRel, kind) {
  const abs = resolve(REPO_ROOT, rnRel);
  if (kind === 'hooks-only') return reachable.has(`${abs}.ts`) || reachable.has(`${abs}.tsx`);
  const files = [];
  const walk = (p) => {
    if (!existsSync(p)) return;
    if (statSync(p).isFile()) { if (/\.[jt]sx?$/.test(p)) files.push(p); return; }
    for (const n of readdirSync(p)) walk(resolve(p, n));
  };
  walk(abs); walk(`${abs}.tsx`); walk(`${abs}.ts`);
  return files.some((f) => reachable.has(f));
}

const inScope = (u) => milestone == null || u.milestone === milestone;
const wired = [], unwired = [];
const consider = [
  ...Object.entries(manifest.features || {}).map(([k, u]) => [k, u]),
  ...Object.entries(manifest.curated || {}).map(([k, u]) => [`curated/${k}`, u]),
];
for (const [key, u] of consider) {
  if (u.status && u.status !== 'port') continue;
  if (!u.rn || !inScope(u)) continue;
  // pages themselves are entries; skip
  if (/\/pages\//.test(u.rn)) continue;
  (isWired(u.rn, u.kind) ? wired : unwired).push(key);
}

console.log(c.bold(`\nWiring reachability  ${c.dim(`(${milestone ? 'milestone ' + milestone : 'all'}) · ${entries.length} entry pages`)}\n`));
console.log(`  ${c.green('✓')} wired     ${wired.length}`);
console.log(`  ${unwired.length ? c.red('✗') : c.green('✓')} unwired   ${unwired.length} ${c.dim('(built but not reachable from any page)')}`);
for (const k of unwired.sort()) console.log(`      ${c.red(k)}`);
console.log(`\n  ${unwired.length ? c.red(unwired.length + ' unwired') : c.green('all wired')}\n`);
process.exit(unwired.length ? 1 : 0);
