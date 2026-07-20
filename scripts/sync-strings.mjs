#!/usr/bin/env node
// sync-strings.mjs — vendor the chat/UIKit localization (copy) from the web foundations.
// IDEMPOTENT / re-runnable. The web core/localization layer is portable (no DOM), so it's
// copied verbatim: useString/resolveString/LocaleProvider + the en/th string bundles.
// Chat's 176 useString('amity_*') calls then work unchanged.
//
//   node scripts/sync-strings.mjs [--web=/abs/AmityUiKitWeb]
//
// Output: src/core/localization/** (mirrors AmityUiKitWeb src/v4/core/localization, minus __tests__)

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { RN, REPO_ROOT, WEB_ROOT, webPath, c } from './port/paths.mjs';

// LocaleProvider.tsx uses browser `navigator` (no DOM lib in RN tsconfig) + an unused import.
// Patch it to an RN-safe global access so the vendored file typechecks. Re-applied every sync.
function patchLocaleProvider(src) {
  let out = src.replace(/,\s*useRef(?=,| )/, ''); // drop unused useRef import
  out = out.replace(
    /if \(typeof navigator === 'undefined'\) return undefined;\s*\n\s*const lang = navigator\.language \?\? '';/,
    "const nav = (globalThis as { navigator?: { language?: string } }).navigator;\n" +
      "  if (!nav || typeof nav.language !== 'string') return undefined;\n" +
      "  const lang = nav.language ?? '';"
  );
  return out;
}

const SRC = webPath('src/v4/core/localization');
if (!existsSync(SRC)) {
  console.error(c.red(`  Web localization not found at ${SRC} (pass --web=/abs/path to AmityUiKitWeb)`));
  process.exit(2);
}

mkdirSync(RN.localizationDir, { recursive: true });

// copy every file except __tests__, preserving structure
let copied = 0;
function copyDir(fromDir, toDir) {
  for (const name of readdirSync(fromDir)) {
    if (name === '__tests__') continue;
    const from = resolve(fromDir, name);
    const to = resolve(toDir, name);
    if (statSync(from).isDirectory()) {
      mkdirSync(to, { recursive: true });
      copyDir(from, to);
    } else if (name === 'LocaleProvider.tsx') {
      writeFileSync(to, patchLocaleProvider(readFileSync(from, 'utf8')), 'utf8');
      copied++;
    } else {
      cpSync(from, to);
      copied++;
    }
  }
}
copyDir(SRC, RN.localizationDir);

const en = JSON.parse(readFileSync(RN.localeEnJson, 'utf8'));
const chatKeys = Object.keys(en).filter((k) => /^amity_chat/.test(k)).length;
console.log(`  ${c.green('✓')} ${relative(REPO_ROOT, RN.localizationDir)}/  (${copied} files)`);
console.log(
  `\n${c.bold('Vendored')} localization · ${Object.keys(en).length} keys (en) · ${chatKeys} amity_chat_* · th included\n`
);
