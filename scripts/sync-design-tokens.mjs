#!/usr/bin/env node
// sync-design-tokens.mjs — vendor the SoT theming contract into the RN repo.
// IDEMPOTENT / re-runnable: run it again whenever a design drop lands in cleverden.
// Source is the FE-consumed token package: front-end-tech-specs/UIKIT/tokens/.
//
//   node scripts/sync-design-tokens.mjs [--sot=/path/to/cleverden]
//
// Vendored into src/core/design/tokens/:
//   config-resolver.js              the resolver (semantic→alias→{theme.key}→hex), reused directly
//   amity-uikit-design-tokens.json  alias/semantic table the resolver reads
//   amity-uikit-config.json         49-key config template = base config (matches web colors)
//   amity-color-tokens.ts           AmityColorToken vocabulary (names + paths); baked hex NOT used at runtime
//   CHECKSUMS.json                  freshness pin (schema 3 / tokenCount 717)

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { relative } from 'node:path';
import { SOT, RN, REPO_ROOT, assertSot, c } from './port/paths.mjs';

assertSot();
mkdirSync(RN.tokensDir, { recursive: true });

let copied = 0;
const copy = (src, dest) => {
  if (!existsSync(src)) {
    console.error(c.red(`  MISSING SoT source: ${src}`));
    process.exit(2);
  }
  copyFileSync(src, dest);
  copied++;
  console.log(`  ${c.green('✓')} ${relative(REPO_ROOT, dest)}`);
};

copy(SOT.resolver, RN.resolver);
copy(SOT.tokensJson, RN.tokensJson);
copy(SOT.configTemplate, RN.configTemplate);
copy(SOT.colorTokensTs, RN.colorTokensTs);
copy(SOT.checksums, RN.checksums);

// Clean up the simplified-resolver artifact from an earlier iteration, if present.
const staleResolveColor = RN.tokensDir + '/resolveColor.ts';
if (existsSync(staleResolveColor)) {
  rmSync(staleResolveColor);
  console.log(`  ${c.dim('removed stale')} resolveColor.ts`);
}

// Sanity summary from what we just vendored.
const tokens = JSON.parse(readFileSync(RN.tokensJson, 'utf8'));
const checks = JSON.parse(readFileSync(RN.checksums, 'utf8'));
const aliasN = Object.keys(tokens.alias || {}).length;
const semN = Object.keys(tokens.semantic || {}).length;

console.log(
  `\n${c.bold('Vendored')} ${copied} files · alias ${aliasN} · semantic ${semN} · ` +
    `pin schema ${checks.schema_version}/tokenCount ${checks.tokenCount}`
);

if (semN !== checks.tokenCount) {
  console.error(
    c.yellow(
      `\n  WARNING: semantic count (${semN}) != CHECKSUMS.tokenCount (${checks.tokenCount}). ` +
        `Design drop may be mid-flight — verify with the design team.`
    )
  );
}
console.log(c.dim('\nNext: node scripts/sync-icons.mjs && node scripts/check-port.mjs\n'));
