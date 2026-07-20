#!/usr/bin/env node
// check-port.mjs — DETERMINISTIC verification that the color-system + chat port is correct.
// Exit 0 only if every non-skipped check passes; exit 1 on any failure.
// Composed of independent checks so it is useful NOW (tokens/icons green) and grows
// meaningful as the chat feature lands. Chat-structure checks SKIP (not fail) until scaffolded.
//
//   node scripts/check-port.mjs           # fast structural + integrity checks
//   node scripts/check-port.mjs --full    # also runs `yarn typecheck` + `yarn lint`
//   node scripts/check-port.mjs --sot=/path/to/cleverden

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { SOT, RN, REPO_ROOT, SOT_ROOT, c, hasFlag } from './port/paths.mjs';
import { parseColorTokens, loadDesignTokens, buildIndexes, slug } from './port/tokenModel.mjs';

const results = [];
const record = (name, status, detail = '') => results.push({ name, status, detail });
const PASS = 'pass', FAIL = 'fail', SKIP = 'skip';

// ---------- helpers ----------
function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (e === 'node_modules' || e === 'generated') continue;
      walk(p, exts, out);
    } else if (exts.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;

// ================= CHECK 1: token integrity (ports check-tokens.mjs) =================
try {
  if (!existsSync(RN.tokensJson)) {
    record('token integrity', SKIP, 'tokens not vendored — run sync-design-tokens.mjs');
  } else {
    const t = loadDesignTokens(RN.tokensJson);
    const alias = t.alias || {};
    const semantic = t.semantic || {};
    const themeKeysFromAlias = new Set();
    const errs = [];

    // every alias must be exactly "{theme.X}" (optionally @alpha)
    for (const [name, ref] of Object.entries(alias)) {
      const m = /^\{theme\.([a-z0-9_]+)\}(?:@alpha:[0-9.]+)?$/.exec(String(ref));
      if (!m) errs.push(`alias '${name}' not a clean {theme.X}: ${ref}`);
      else themeKeysFromAlias.add(m[1]);
    }
    // every semantic entry: light/dark parity; {Alias} refs must exist
    let semCount = 0;
    for (const [name, val] of Object.entries(semantic)) {
      semCount++;
      const hasL = val && val.light != null;
      const hasD = val && val.dark != null;
      if (hasL !== hasD) errs.push(`semantic '${name}' light/dark parity broken`);
      for (const side of ['light', 'dark']) {
        const cell = val && val[side];
        if (cell == null) continue;
        if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(cell)) continue; // hex literal ok
        const m = /^\{([^}]+)\}(?:@alpha:[0-9.]+)?$/.exec(cell);
        if (!m) { errs.push(`semantic '${name}.${side}' unparseable: ${cell}`); continue; }
        const ref = m[1];
        if (ref.startsWith('theme.')) continue; // direct theme ref ok
        if (!(ref in alias)) errs.push(`semantic '${name}.${side}' -> unknown alias {${ref}}`);
      }
    }
    const aliasN = Object.keys(alias).length;
    if (errs.length) record('token integrity', FAIL, `${errs.length} issue(s): ${errs.slice(0, 3).join(' | ')}`);
    else record('token integrity', PASS, `${aliasN} alias · ${semCount} semantic · parity + refs valid`);
  }
} catch (e) { record('token integrity', FAIL, e.message); }

// ================= CHECK 2: contract parity (vendored == SoT) + checksum pin =================
try {
  if (!existsSync(RN.tokensJson) || !existsSync(RN.checksums)) {
    record('contract parity', SKIP, 'not vendored');
  } else {
    const errs = [];
    // 2a. vendored design-tokens deep-equals SoT (if SoT reachable)
    if (existsSync(SOT.tokensJson)) {
      const a = readFileSync(RN.tokensJson, 'utf8');
      const b = readFileSync(SOT.tokensJson, 'utf8');
      if (JSON.stringify(JSON.parse(a)) !== JSON.stringify(JSON.parse(b)))
        errs.push('vendored design-tokens.json differs from SoT (stale — re-run sync)');
    }
    // 2b. checksum pin vs semantic count vs AmityColorToken count
    const checks = JSON.parse(readFileSync(RN.checksums, 'utf8'));
    const semN = Object.keys(loadDesignTokens(RN.tokensJson).semantic || {}).length;
    if (semN !== checks.tokenCount) errs.push(`semantic ${semN} != CHECKSUMS ${checks.tokenCount}`);
    if (existsSync(RN.colorTokensTs)) {
      const toks = parseColorTokens(RN.colorTokensTs);
      if (toks.length !== checks.tokenCount) errs.push(`AmityColorToken ${toks.length} != CHECKSUMS ${checks.tokenCount}`);
      // .path set must equal semantic keys
      const semKeys = new Set(Object.keys(loadDesignTokens(RN.tokensJson).semantic || {}));
      const pathSet = new Set(toks.map((t) => t.path));
      const missing = [...semKeys].filter((k) => !pathSet.has(k));
      if (missing.length) errs.push(`${missing.length} semantic paths missing from AmityColorToken`);
    }
    if (errs.length) record('contract parity', FAIL, errs.join(' | '));
    else record('contract parity', PASS, `pinned schema ${checks.schema_version}/${checks.tokenCount}, matches SoT`);
  }
} catch (e) { record('contract parity', FAIL, e.message); }

// ============ CHECK 2b: resolver completeness + web-parity canary ============
// Proves config-resolver.js + config template resolves ALL 717 tokens (0 missing) and
// that known tokens land on web's shipping hex — i.e. RN colors == web colors.
try {
  const need = [RN.resolver, RN.tokensJson, RN.configTemplate];
  if (!need.every(existsSync)) {
    record('resolver complete', SKIP, 'resolver/table/config not vendored');
  } else {
    const require = createRequire(import.meta.url);
    const R = require(RN.resolver);
    const table = require(RN.tokensJson);
    const cfg = require(RN.configTemplate);
    const paths = Object.keys(table.semantic || {});
    let missing = 0;
    for (const p of paths) {
      const l = R.resolveToken(cfg, table, '*/*/*', 'light', p);
      const d = R.resolveToken(cfg, table, '*/*/*', 'dark', p);
      if (l.source === 'missing' || d.source === 'missing') missing++;
    }
    // web-parity canaries (the values web's defaultConfig.theme ships)
    const canaries = [
      ['Surface/Page/Background/Default', 'dark', '#191919'],
      ['Surface/MainButton/Default/Filled/Primary/Enabled', 'light', '#1054DE'],
    ];
    const bad = [];
    for (const [p, mode, want] of canaries) {
      const got = R.resolveToken(cfg, table, '*/*/*', mode, p).value;
      if ((got || '').toUpperCase() !== want.toUpperCase()) bad.push(`${p}(${mode})=${got}!=${want}`);
    }
    if (missing) record('resolver complete', FAIL, `${missing}/${paths.length} tokens unresolved (missing)`);
    else if (bad.length) record('resolver complete', FAIL, `web-parity drift: ${bad.join(', ')}`);
    else record('resolver complete', PASS, `${paths.length}/${paths.length} resolve · web-parity canaries OK`);
  }
} catch (e) { record('resolver complete', FAIL, e.message); }

// ================= CHECK 3: no hardcoded hex in design + chat source =================
try {
  const scanDirs = [RN.designAtomsDir, resolve(RN.tokensDir, '..', 'theme'), RN.chatFeatureDir];
  const files = scanDirs.flatMap((d) => walk(d, ['.ts', '.tsx']));
  if (!files.length) {
    record('no hardcoded hex', SKIP, 'no design/chat source yet');
  } else {
    const bad = [];
    for (const f of files) {
      const lines = readFileSync(f, 'utf8').split('\n');
      lines.forEach((ln, i) => {
        if (HEX_RE.test(ln) && !/eslint|PORT STUB|default\s*=\s*'#292B32'/.test(ln))
          bad.push(`${relative(REPO_ROOT, f)}:${i + 1}`);
      });
    }
    if (bad.length) record('no hardcoded hex', FAIL, `${bad.length} hex literal(s): ${bad.slice(0, 3).join(', ')}`);
    else record('no hardcoded hex', PASS, `${files.length} files clean`);
  }
} catch (e) { record('no hardcoded hex', FAIL, e.message); }

// ================= CHECK 4: AmityColorToken references valid =================
try {
  if (!existsSync(RN.colorTokensTs)) {
    record('token refs valid', SKIP, 'tokens not vendored');
  } else {
    const { nameSet } = buildIndexes(parseColorTokens(RN.colorTokensTs));
    const files = [RN.designAtomsDir, RN.chatFeatureDir].flatMap((d) => walk(d, ['.ts', '.tsx']));
    const bad = [];
    const REF = /AmityColorToken\.([A-Za-z0-9_]+)/g;
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      let m;
      while ((m = REF.exec(src)) !== null) if (!nameSet.has(m[1])) bad.push(`${relative(REPO_ROOT, f)}: ${m[1]}`);
    }
    if (!files.length) record('token refs valid', SKIP, 'no design/chat source yet');
    else if (bad.length) record('token refs valid', FAIL, `${bad.length} unknown token(s): ${bad.slice(0, 3).join(', ')}`);
    else record('token refs valid', PASS, `all AmityColorToken.* references exist`);
  }
} catch (e) { record('token refs valid', FAIL, e.message); }

// ================= CHECK 5: icon parity =================
try {
  if (!existsSync(RN.iconRegistry)) {
    record('icon parity', SKIP, 'icons not synced — run sync-icons.mjs');
  } else {
    const reg = readFileSync(RN.iconRegistry, 'utf8');
    const countM = /AMITY_ICON_COUNT = (\d+)/.exec(reg);
    const regCount = countM ? Number(countM[1]) : 0;
    const errs = [];
    if (existsSync(SOT.iconsDir)) {
      const sotCount = readdirSync(SOT.iconsDir).filter((f) => f.toLowerCase().endsWith('.svg')).length;
      if (regCount !== sotCount) errs.push(`registry ${regCount} != SoT ${sotCount}`);
    }
    // referenced icon names in chat source must exist in registry
    const names = new Set([...reg.matchAll(/^\s*"([^"]+)":\s*`/gm)].map((m) => m[1]));
    const files = walk(RN.chatFeatureDir, ['.ts', '.tsx']);
    const bad = [];
    const USE = /getIconXml\(\s*['"]([^'"]+)['"]/g;
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      let m;
      while ((m = USE.exec(src)) !== null) if (!names.has(m[1])) bad.push(`${relative(REPO_ROOT, f)}: ${m[1]}`);
    }
    if (bad.length) errs.push(`${bad.length} unknown icon ref(s): ${bad.slice(0, 3).join(', ')}`);
    if (errs.length) record('icon parity', FAIL, errs.join(' | '));
    else record('icon parity', PASS, `${regCount} icons · all references valid`);
  }
} catch (e) { record('icon parity', FAIL, e.message); }

// ============ CHECK 6: structural parity (offline, from web-parity-map.json) ============
// Uses the single manifest's 'port' units (rn paths are local, so this stays offline —
// no web repo needed). Full web-derived completeness is check-web-parity.mjs.
try {
  const manifestPath = resolve(RN.portDir, 'web-parity-map.json');
  if (!existsSync(manifestPath)) {
    record('structural parity', SKIP, 'web-parity-map.json not present (token-only branch)');
    throw { __skip: true };
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const portUnits = [
    ...Object.entries(manifest.units).filter(([, u]) => u.status === 'port' && u.rn),
    ...Object.entries(manifest.curated || {}).map(([k, u]) => [`curated/${k}`, u]),
  ];
  const anyExists = portUnits.some(([, u]) => existsSync(resolve(REPO_ROOT, u.rn)));
  if (!anyExists) {
    record('structural parity', SKIP, 'chat/design tree not scaffolded yet');
  } else {
    const missing = portUnits.filter(([, u]) => !existsSync(resolve(REPO_ROOT, u.rn))).map(([k]) => k);
    const total = portUnits.length;
    if (missing.length) record('structural parity', FAIL, `${missing.length}/${total} missing: ${missing.slice(0, 4).join(', ')}`);
    else record('structural parity', PASS, `${total}/${total} port units present`);
  }
} catch (e) { if (!e.__skip) record('structural parity', FAIL, e.message); }

// ================= CHECK 7 (optional): toolchain =================
if (hasFlag('--full')) {
  for (const [name, cmd] of [['typecheck', 'yarn typecheck'], ['lint', 'yarn lint']]) {
    try {
      execSync(cmd, { cwd: REPO_ROOT, stdio: 'pipe' });
      record(name, PASS, cmd);
    } catch (e) {
      record(name, FAIL, `${cmd} failed`);
    }
  }
}

// ---------- report ----------
console.log(c.bold(`\nChat/Color port verification  ${c.dim('SoT: ' + relative(REPO_ROOT, SOT_ROOT))}\n`));
const icon = { pass: c.green('✓'), fail: c.red('✗'), skip: c.yellow('–') };
for (const r of results) {
  console.log(`  ${icon[r.status]} ${r.name.padEnd(20)} ${c.dim(r.detail)}`);
}
const failed = results.filter((r) => r.status === FAIL).length;
const passed = results.filter((r) => r.status === PASS).length;
const skipped = results.filter((r) => r.status === SKIP).length;
console.log(`\n  ${passed} passed · ${failed} failed · ${skipped} skipped\n`);
process.exit(failed ? 1 : 0);
