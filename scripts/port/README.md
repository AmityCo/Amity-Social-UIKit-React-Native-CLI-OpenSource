# Chat + Color-System port pipeline

Scripts that port the new **color system** and **chat feature** into this RN UIKit from the
source-of-truth (`cleverden`) and the web UIKit branch `AmityUiKitWeb@origin/feat/PDT-3712-chat-dark-theme`.

Full plan: `~/.claude/plans/can-you-make-a-frolicking-quasar.md`.

## The source split

- **Data / assets / contract → from the SoT (`cleverden`)**: token JSON, `config-resolver.js`,
  `AmityColorToken` map, `CHECKSUMS.json`, icon SVGs. Vendored verbatim.
- **Structure / behavior / which-token-where → from the web branch**: component tree, SDK hooks,
  and the CSS-var→semantic-path reverse map.

## Scripts

| Script                    | Kind       | What it does                                                                                                                                                                                                                                          |
| ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync-design-tokens.mjs`  | idempotent | Vendor the 5 SoT theming-contract files → `src/core/design/tokens/` (`config-resolver.js`, `amity-uikit-design-tokens.json`, `amity-uikit-config.json` = 49-key base config, `amity-color-tokens.ts`, `CHECKSUMS.json`). Re-run on every design drop. |
| `sync-icons.mjs`          | idempotent | Turn the 206 SoT SVGs into `src/core/design/icons/generated/iconRegistry.ts` (`name → xml`, fill parameterized for tinting).                                                                                                                          |
| `extract-token-usage.mjs` | idempotent | Reverse-map the web chat `--asc-color-*` CSS vars → `AmityColorToken` names, per file → `scripts/port/token-usage.json`.                                                                                                                              |
| `scaffold-chat.mjs`       | one-time   | Create the RN chat folder tree (stubs, CLAUDE.md conventions, annotated with source + tokens). **Dry-run by default**; `--write` to create.                                                                                                           |
| `check-port.mjs`          | verifier   | Deterministic checks; exit 1 on any failure. `--full` also runs typecheck + lint.                                                                                                                                                                     |
| `check-web-parity.mjs`    | verifier   | Per-milestone completeness vs the **web** tree (live from git). Reports covered/missing/merge/skip and fails on UNACCOUNTED web units. `--milestone=N` gates a phase.                                                                                 |

## Options

- `--sot=/abs/path/to/cleverden` (or env `AMITY_SOT`) — default `../cleverden`.
- `--web=/abs/path/to/AmityUiKitWeb` (or env `AMITY_WEB`) — default `../AmityUiKitWeb`. The web scripts
  read the **local checkout** (expected branch `feat/PDT-3712-chat-dark-theme`), not git refs.
- `--milestone=N` on `check-web-parity.mjs` and `scaffold-chat.mjs`.

## Run order

```bash
node scripts/sync-design-tokens.mjs     # foundation: tokens + resolver + AmityColorToken
node scripts/sync-icons.mjs             # foundation: icon registry
node scripts/extract-token-usage.mjs    # build the per-component token map
node scripts/check-port.mjs             # verify tokens/icons/structure (green now; grows as chat lands)
node scripts/check-web-parity.mjs --milestone=1   # completeness vs web tree, per milestone
node scripts/scaffold-chat.mjs          # dry-run; add --write when ready to port
```

## Resolver model

Resolution uses `config-resolver.js` (`resolveToken(config, table, scopeId, mode, tokenPath)`) with
`amity-uikit-config.json` (49-key palette) as the base config → resolves all 717 tokens to
**web-matching** hex (`#1054DE`, `#191919`). The baked `defaultHex` in `amity-color-tokens.ts` is from a
newer designer drop that diverges from web on ~500 tokens and is **not** used at runtime — see the plan's
drift note.

## What `check-port.mjs` verifies

1. **token integrity** — 55 alias + 717 semantic; light/dark parity; alias `{theme.X}` valid; semantic `{Alias}` refs exist. (ports `cleverden/governance/design/check-tokens.mjs`)
2. **contract parity** — vendored JSON deep-equals SoT; count/schema pinned to `CHECKSUMS.json`; `AmityColorToken.path` set == semantic keys.
3. **resolver complete** — `config-resolver.js` + template resolves 717/717 (0 missing) and hits web-parity canaries.
4. **no hardcoded hex** — golden rule, scans `src/core/design/**` + `src/social/features/chat/**`.
5. **token refs valid** — every `AmityColorToken.X` used in source exists.
6. **icon parity** — registry count == SoT; every `getIconXml('name')` exists.
7. **structural parity** — every `port` unit in `web-parity-map.json` (units + curated) has its RN file (offline; rn paths are local).

**Single manifest:** `web-parity-map.json` is the one source of truth — `roots`/`units` (enumerable web dirs, auto-checked against the **local** web checkout) + `curated` (the 10 feature-nested components). `check-web-parity.mjs`, `check-port.mjs`, and `scaffold-chat.mjs` all read it; `expected-inventory.json` is retired.

Checks that need chat source **skip** (not fail) until the feature is scaffolded/ported.

> Nothing here is committed automatically. The theming provider/hook, the atoms, and the chat
> components are the next increment — gated on review of this pass.
