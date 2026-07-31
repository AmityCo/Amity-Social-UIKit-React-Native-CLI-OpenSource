#!/usr/bin/env node
// check-chat-toasts.mjs — deterministic guard that every toast raised inside the
// chat feature renders as the chat "custom" dark pill.
//
// Why: web routes ALL chat notifications through `useNotifications('chat')`, which
// is a single custom toast style. In RN that maps to `showToast({ ..., variant:
// 'custom' })` (see useChatNotifications). Several ported hooks called `showToast`
// with only a `type` and NO `variant`, so they rendered the app-wide DEFAULT toast
// — a visibly different colour (theme.colors.base vs SurfaceCustomToast). This
// check fails if any `showToast(...)` under src/social/features/chat omits
// `variant: 'custom'`, keeping every chat toast aligned.
//
// Usage: node scripts/check-chat-toasts.mjs   (exit 0 = all aligned, 1 = violations)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const CHAT_ROOT = join(REPO_ROOT, 'src/social/features/chat');

const SOURCE_EXT = /\.(ts|tsx)$/;
// variant: 'custom' | variant: "custom" (tolerate either quote + flexible spaces).
const CUSTOM_VARIANT = /variant\s*:\s*['"]custom['"]/;

/** Recursively collect .ts/.tsx files under `dir`. */
function collectFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === '__tests__' || entry === 'node_modules') continue;
      out.push(...collectFiles(full));
    } else if (SOURCE_EXT.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Extract the argument text of each `showToast(...)` call in `src` via balanced
 * paren matching (so multi-line object literals are captured whole). Returns
 * `{ index, arg }` for each call, where `index` is the offset of the `(`.
 */
function extractShowToastCalls(src) {
  const calls = [];
  const marker = 'showToast(';
  let from = 0;
  for (;;) {
    const hit = src.indexOf(marker, from);
    if (hit === -1) break;
    const openParen = hit + marker.length - 1;
    let depth = 0;
    let end = -1;
    for (let i = openParen; i < src.length; i += 1) {
      const ch = src[i];
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) {
      // Unbalanced — skip past the marker to avoid an infinite loop.
      from = openParen + 1;
      continue;
    }
    calls.push({ index: hit, arg: src.slice(openParen + 1, end) });
    from = end + 1;
  }
  return calls;
}

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length;
}

const files = collectFiles(CHAT_ROOT);
const violations = [];
let callCount = 0;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('showToast(')) continue;
  for (const { index, arg } of extractShowToastCalls(src)) {
    // A call whose argument is just an identifier (e.g. re-export/alias) has no
    // object literal to check — only enforce on object-literal calls.
    if (!arg.includes('{')) continue;
    callCount += 1;
    if (!CUSTOM_VARIANT.test(arg)) {
      violations.push({
        file: relative(REPO_ROOT, file),
        line: lineOf(src, index),
      });
    }
  }
}

if (violations.length === 0) {
  console.log(
    `✓ chat toasts aligned — all ${callCount} showToast(...) call(s) under ` +
      `src/social/features/chat pass variant: 'custom'.`
  );
  process.exit(0);
}

console.error(
  `✗ ${violations.length} chat toast(s) are NOT aligned (missing variant: 'custom').\n` +
    `  Web routes every chat notification through the custom dark pill; add\n` +
    `  \`variant: 'custom'\` to each showToast(...) below (or raise it via\n` +
    `  useChatNotifications):\n`
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
}
process.exit(1);
