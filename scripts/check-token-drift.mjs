#!/usr/bin/env node
// check-token-drift.mjs — surfaces drift between the vendored RN token table and
// the web UIKit *develop* table (the live design source). The RN table is vendored
// from the cleverden SoT, which can lag develop; this makes that lag VISIBLE instead
// of silent (it's how the chat-header divider bug hid for three rounds).
//
// Buckets (all informational except broken overrides):
//   • value drift  — shared keys whose alias refs differ (RN behind develop)
//   • renames      — old RN name → new develop name (GreyBG→Subdue, WhiteBG→Default);
//                    verified colour-preserving
//   • new tokens   — develop tokens with no RN counterpart (features not yet built)
//   • overrides    — token-drift-overrides.json entries; MUST match develop, else FAIL
//
// Exit 1 only if a documented interim override no longer matches develop (a stale/
// wrong override). Plain drift is expected pending a SoT sync → exit 0, reported.
//
//   node scripts/check-token-drift.mjs

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { RN, webPath, c } from './port/paths.mjs';

const WEB_TABLE = webPath('src/v4/core/design/tokens/amity-uikit-design-tokens.json');
if (!existsSync(WEB_TABLE) || !existsSync(RN.tokensJson)) {
  console.log(c.dim('\n  token drift: web develop table or RN table not found — skipped\n'));
  process.exit(0);
}

const rnT = JSON.parse(readFileSync(RN.tokensJson, 'utf8'));
const webT = JSON.parse(readFileSync(WEB_TABLE, 'utf8'));
const ovPath = resolve(RN.portDir, 'token-drift-overrides.json');
const overrides = existsSync(ovPath) ? JSON.parse(readFileSync(ovPath, 'utf8')) : {};

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const renameOf = (k) => k.replace('/GreyBG/', '/Subdue/').replace('/WhiteBG/', '/Default/');

const valueDrift = []; // shared key, differing refs, not overridden
const brokenOverrides = []; // documented override that no longer matches develop
const okOverrides = [];
const renames = []; // {old, new, colorPreserving}
const newTokens = []; // develop-only, not a rename target

for (const section of ['alias', 'semantic']) {
  const r = rnT[section] || {};
  const w = webT[section] || {};
  const ov = (overrides[section] || {});
  const rk = new Set(Object.keys(r));
  const wk = new Set(Object.keys(w));

  // shared keys — value drift / overrides
  for (const k of [...rk].filter((x) => wk.has(x))) {
    if (eq(r[k], w[k])) continue;
    if (k in ov) {
      // override is intentional — RN must equal develop to be a valid override
      (eq(r[k], w[k]) ? okOverrides : brokenOverrides).push({ section, k, rn: r[k], web: w[k] });
    } else {
      valueDrift.push({ section, k, rn: r[k], web: w[k] });
    }
  }
  // an override whose RN value equals develop still shows as "shared+equal" above and
  // is skipped; re-scan overrides explicitly to confirm each is present + matching.
  for (const k of Object.keys(ov)) {
    if (!(k in r) || !(k in w)) continue;
    if (eq(r[k], w[k])) okOverrides.push({ section, k });
    else if (!brokenOverrides.find((b) => b.k === k)) brokenOverrides.push({ section, k, rn: r[k], web: w[k] });
  }

  // RN-only keys → renamed (has a develop counterpart) or removed
  for (const k of [...rk].filter((x) => !wk.has(x))) {
    const nk = renameOf(k);
    if (nk !== k && wk.has(nk)) renames.push({ old: k, new: nk, colorPreserving: eq(r[k], w[nk]) });
  }
  // develop-only keys not reached by a rename → genuinely new
  for (const k of [...wk].filter((x) => !rk.has(x))) {
    const back = k.replace('/Subdue/', '/GreyBG/').replace('/Default/', '/WhiteBG/');
    if (!(back !== k && rk.has(back))) newTokens.push({ section, k });
  }
}

const dedupe = (arr) => [...new Map(arr.map((o) => [o.k, o])).values()];
const okOv = dedupe(okOverrides);

console.log(c.bold(`\nToken drift vs web develop  ${c.dim(`· RN ${Object.keys(rnT.semantic || {}).length} semantic`)}\n`));

if (brokenOverrides.length) {
  console.log(`  ${c.red('✗')} ${brokenOverrides.length} interim override(s) no longer match develop (fix or remove):`);
  for (const b of brokenOverrides) console.log(`      ${b.k}: RN ${JSON.stringify(b.rn)} vs develop ${JSON.stringify(b.web)}`);
}
if (okOv.length)
  console.log(`  ${c.green('✓')} ${okOv.length} documented interim override(s) match develop: ${okOv.map((o) => o.k).join(', ')}`);
if (valueDrift.length) {
  console.log(`  ${c.yellow ? c.yellow('•') : c.dim('•')} ${valueDrift.length} value drift (RN behind develop — override or await SoT sync):`);
  for (const d of valueDrift) console.log(`      ${d.k}: RN ${JSON.stringify(d.rn)} → develop ${JSON.stringify(d.web)}`);
}
const badRenames = renames.filter((r) => !r.colorPreserving);
console.log(`  ${c.dim(`• ${renames.length} renamed token(s) (${renames.length - badRenames.length} colour-preserving)`)}`);
for (const r of badRenames) console.log(`      ${c.red('renamed + colour-changed:')} ${r.old} → ${r.new}`);
console.log(`  ${c.dim(`• ${newTokens.length} new develop token(s) not yet in RN (arrive on SoT sync)`)}`);

console.log(
  `\n  ${brokenOverrides.length || badRenames.length ? c.red('drift check FAILED') : c.green('drift surfaced (no broken overrides)')}` +
    c.dim(` · ${valueDrift.length} value drift · ${renames.length} renames · ${newTokens.length} new\n`)
);
process.exit(brokenOverrides.length || badRenames.length ? 1 : 0);
