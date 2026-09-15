#!/usr/bin/env node
// check-keyboard-avoiding.mjs — DETERMINISTIC "did every chat surface mount the
// keyboard owner?" check.
//
// Scope is deliberately narrow: this proves a surface MOUNTS
// ChatKeyboardAvoidingView, not that it mounts it in the right PLACE.
// "Right place" means no ancestor between it and the top of the screen adds an
// offset, and that cannot be read off the JSX — the padding usually lives in
// another file's stylesheet, and harmless wrappers that introduce no offset
// would trip any structural rule. So this catches "forgot to add it", which a
// presence check gets exactly right, and leaves "added it in the wrong place"
// to a runtime assertion, which can measure the invariant instead of guessing
// at it from syntax.
//
//   yarn check:keyboard-avoiding
//   node scripts/check-keyboard-avoiding.mjs --root=/path/to/other/checkout
//
// A surface that genuinely should not own the keyboard opts out with a marker
// comment on its own line:
//
//   // keyboard-owner: none — <reason>
//
// Exit 1 if any in-scope surface neither mounts the element nor opts out.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { REPO_ROOT, c } from './port/paths.mjs';

const argRoot = process.argv.find((a) => a.startsWith('--root='));
const ROOT = argRoot ? resolve(argRoot.slice('--root='.length)) : REPO_ROOT;

const OWNER = 'ChatKeyboardAvoidingView';
const OPT_OUT = /^\s*\/\/\s*keyboard-owner:\s*none\b/m;

const CHAT = resolve(ROOT, 'src/chat');
const PAGES = resolve(CHAT, 'pages');

const rel = (f) => relative(ROOT, f);
const read = (f) => {
  try {
    return readFileSync(f, 'utf8');
  } catch {
    return null;
  }
};

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx$/.test(full)) out.push(full);
  }
  return out;
}

// Rule 1 — every navigation destination under src/chat/pages owns the keyboard.
// The padding is a no-op until a keyboard actually opens, so mounting it
// uniformly means a screen that later grows a text field cannot silently miss
// out. That uniformity is what makes the rule checkable in the first place.
function pageSurfaces() {
  if (!existsSync(PAGES)) return [];
  return readdirSync(PAGES)
    .map((name) => join(PAGES, name, 'index.tsx'))
    .filter((f) => existsSync(f))
    .map((file) => ({ file, why: 'chat page' }));
}

// Rule 2 — a full-screen Modal that hosts text entry owns its own keyboard.
// A Modal renders in its own native hierarchy, so nothing the page wraps around
// its content reaches inside one: whatever the page mounted does not apply here.
function modalSurfaces() {
  return walk(CHAT)
    .filter((f) => !f.startsWith(PAGES))
    .map((file) => ({ file, src: read(file) }))
    .filter(({ src }) => src && /<Modal[\s>]/.test(src))
    // Text entry here is rarely a bare <TextInput>: chat composes through
    // <TextEditor> and forms through the <Input.Text> atom. Miss one of those
    // spellings and this rule silently covers nothing — which is what happened
    // the first time this script was run, when it matched zero modals while
    // ContentReportReason sat right there with an <Input.Text> in it.
    .filter(({ src }) =>
      /<TextInput[\s>]|<TextEditor[\s>]|<Input\.Text[\s>]/.test(src)
    )
    .map(({ file }) => ({ file, why: 'modal with text entry' }));
}

const surfaces = [...pageSurfaces(), ...modalSurfaces()];

if (surfaces.length === 0) {
  console.error(
    c.red(`✗ no chat surfaces found under ${rel(CHAT)} — wrong --root?`)
  );
  process.exit(1);
}

const missing = [];
let optedOut = 0;

for (const { file, why } of surfaces) {
  const src = read(file);
  if (src == null) continue;
  if (new RegExp(`<${OWNER}[\\s>]`).test(src)) continue;
  if (OPT_OUT.test(src)) {
    optedOut++;
    continue;
  }
  missing.push({ file, why });
}

if (missing.length === 0) {
  console.log(
    c.green(
      `✓ keyboard owner mounted on all ${surfaces.length} chat surface(s)` +
        (optedOut ? ` (${optedOut} opted out)` : '')
    )
  );
  process.exit(0);
}

console.error(
  c.red(`✗ ${missing.length} chat surface(s) do not mount ${OWNER}.\n`) +
    `  Every chat page and every full-screen modal with text entry has to own\n` +
    `  its own bottom edge: the keyboard's occlusion while it is open, the\n` +
    `  safe-area inset while it is closed. A Modal cannot inherit this from the\n` +
    `  page — it renders in its own native hierarchy.\n\n` +
    `  Wrap the surface's content in <${OWNER}>, directly inside its\n` +
    `  SafeAreaView, or opt out on its own line with:\n` +
    c.dim(`    // keyboard-owner: none — <reason>\n`)
);
for (const { file, why } of missing) {
  console.error(`  ${rel(file)} ${c.dim(`(${why})`)}`);
}
process.exit(1);
