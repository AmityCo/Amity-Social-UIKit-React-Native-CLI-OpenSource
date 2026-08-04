#!/usr/bin/env node
// check-geometry.mjs — DETERMINISTIC, high-fidelity geometry gate (Gate #5).
// For each mapped component (scripts/port/geometry-map.json) whose RN styles.ts exists,
// resolves the expected value FROM the vendored SoT geometry (geometry.json) and asserts
// the RN styles declare `rnProp: <value>`. SoT is the single source of truth — no numbers
// are duplicated in the map. Components not yet ported are SKIPPED.
//
//   node scripts/check-geometry.mjs
//
// Exit 1 if any mapped+present component has a missing or mismatched geometry prop.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT, RN, c } from './port/paths.mjs';

if (!existsSync(RN.geometryJson)) {
  console.error(c.red('  geometry.json not vendored — run sync-geometry.mjs'));
  process.exit(2);
}
const geometry = JSON.parse(readFileSync(RN.geometryJson, 'utf8'));
const map = JSON.parse(readFileSync(resolve(RN.portDir, 'geometry-map.json'), 'utf8'));

// resolve a dot-path (with numeric array indices) into geometry.json
function sotValue(path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), geometry);
}

// gather numeric declarations `<prop>: <number>` from a component's styles.ts files
function collectStyleProps(rnRel) {
  const abs = resolve(REPO_ROOT, rnRel);
  const files = [];
  const walk = (p) => {
    if (!existsSync(p)) return;
    if (statSync(p).isFile()) { if (/\.[jt]sx?$/.test(p)) files.push(p); return; }
    for (const n of readdirSync(p)) walk(resolve(p, n));
  };
  walk(abs);
  const props = {}; // prop -> Set of numeric values found
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/\b([a-zA-Z]+):\s*(-?[0-9.]+)\b/g)) {
      (props[m[1]] ||= new Set()).add(Number(m[2]));
    }
  }
  return props;
}

const results = [];
for (const [name, entry] of Object.entries(map.components || {})) {
  const abs = resolve(REPO_ROOT, entry.rn);
  if (!existsSync(abs)) { results.push({ name, status: 'skip' }); continue; }
  const styleProps = collectStyleProps(entry.rn);
  const problems = [];
  for (const p of entry.props) {
    const expected = sotValue(p.sot);
    if (expected == null) { problems.push(`${p.rnProp}: SoT path '${p.sot}' not found`); continue; }
    const found = styleProps[p.rnProp];
    if (!found) { problems.push(`${p.rnProp}: missing (expected ${JSON.stringify(expected)})`); continue; }
    if (p.oneOf) {
      const allowed = Array.isArray(expected) ? expected : [expected];
      if (![...found].some((v) => allowed.includes(v)))
        problems.push(`${p.rnProp}: ${[...found].join('/')} not one of ${JSON.stringify(allowed)}`);
    } else if (!found.has(Number(expected))) {
      problems.push(`${p.rnProp}: ${[...found].join('/')} != ${expected}`);
    }
  }
  results.push({ name, status: problems.length ? 'fail' : 'pass', problems });
}

// ---- report ----
console.log(c.bold('\nGeometry gate (RN styles vs SoT geometry.json)\n'));
let failed = 0;
for (const r of results) {
  if (r.status === 'skip') { console.log(`  ${c.yellow('–')} ${r.name} ${c.dim('(not ported yet)')}`); continue; }
  if (r.status === 'pass') { console.log(`  ${c.green('✓')} ${r.name}`); continue; }
  failed++;
  console.log(`  ${c.red('✗')} ${r.name}`);
  for (const p of r.problems) console.log(`      ${c.red(p)}`);
}
const pass = results.filter((r) => r.status === 'pass').length;
const skip = results.filter((r) => r.status === 'skip').length;
console.log(`\n  ${pass} pass · ${failed} fail · ${skip} skip${failed ? '' : c.green('  (geometry OK)')}\n`);
process.exit(failed ? 1 : 0);
