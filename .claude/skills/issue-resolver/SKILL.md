---
name: issue-resolver
description: Use when resolving a QA-filed Jira ticket (PDT-XXXX) in the Amity Social UIKit React Native (CLI) repo. Triggers on a pasted Atlassian Jira URL. Orchestrates: ticket + Figma analysis → plan approval gate → branch and implementation → manual QA gate → yarn build → conventional-commit and push.
---

# Issue Resolver

This skill turns a single QA-filed Jira ticket into a pushed branch ready for the user to open a PR. It runs in five sequential stages (plus an optional Stage 6 for tickets that need no code change), each gated on user approval before moving forward.

| Stage                          | Output                                                                     | When                                                     |
| ------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1 — Analyze                    | Ticket moved to **In Progress** + expected-vs-actual summary in chat       | After the user pastes a Jira URL                         |
| 2 — Plan + approval gate       | Approved fix plan via `ExitPlanMode`                                       | After Stage 1                                            |
| 3 — Branch + implement         | New branch + applied code changes, file paths listed first in each handoff | After plan approval                                      |
| 4 — Manual QA gate             | User says "ok to commit"                                                   | After implementation                                     |
| 5 — Build + commit + push      | Pushed branch + compare URL targeting Stage 3 base                         | After QA sign-off                                        |
| 6 — Jira transition (optional) | Ticket moved (e.g. "Deployed to Dev")                                      | Only if user decides no code change is needed in Stage 1 |

**Never skip ahead.** The user reviews and approves at every stage gate. Do not begin Stage 3 until the plan is approved. Do not begin Stage 5 until the user has manually QA'd the change.

## When to use

The user pastes an Atlassian Jira URL (e.g. `https://amity.atlassian.net/browse/PDT-2900`) and asks for the issue to be resolved. Also use when the user invokes the skill by name with a URL.

**Do not** invoke this skill for:

- Open-ended feature work — use the [`features`](../features/SKILL.md) skill directly.
- Multi-ticket batch fixes — run the skill once per ticket.
- Non-PDT projects — this skill assumes the `PDT-` Jira key prefix and the Amity Social UIKit React Native repo conventions.

---

# Stage 1 — Analyze

Parse the ticket key from the URL (regex `PDT-\d+`). If the URL does not contain a `PDT-\d+` key, stop and ask the user for the correct URL — do not guess.

## Stage 1 — Fetch the ticket

Run in a single tool batch:

1. `mcp__claude_ai_Atlassian__getAccessibleAtlassianResources` to get the `cloudId`.
2. `mcp__claude_ai_Atlassian__getJiraIssue` with the ticket key and the resolved `cloudId`.

From the returned issue, extract:

- **Title** and **issue type** (`Bug`, `Task`, `Story`). The issue type drives the commit verb in Stage 5 (`Bug` → `fix:`, otherwise `feat:`).
- **Description** and **acceptance criteria** — read the full body.
- **Figma links** — scan description and comments for any `figma.com/...` URL.
- **Referenced files / components** — scan for file paths, component names, error stacks.
- **Linked PRs or related tickets** if any.
- **Current status** — read `fields.status.name`. If it is already `In Progress`, skip the transition step below; otherwise transition it now.

## Stage 1 — Transition ticket to "In Progress"

As soon as Stage 1 has fetched the ticket and confirmed it is the right one, move it to **In Progress** so QA and PMs can see work has started. Do not wait for plan approval — picking up the ticket is the trigger, not committing code.

1. `mcp__claude_ai_Atlassian__getTransitionsForJiraIssue` with the ticket key + cloudId.
2. Find the transition whose `name` is `In Progress` (case-insensitive). Workflow IDs vary per project — read the list, do not hardcode.
3. `mcp__claude_ai_Atlassian__transitionJiraIssue` with that transition `id`.
4. Confirm to the user in one line: "Moved PDT-XXXX to In Progress."

Skip silently if the ticket is already `In Progress` or if no matching transition exists (some workflows gate it behind a different name — surface that to the user instead of forcing).

## Stage 1 — Figma policy

If the description contains a Figma URL:

1. Authenticate via `mcp__figma__authenticate` + `mcp__figma__complete_authentication` if not already authenticated.
2. Start with `mcp__figma__get_metadata` on the cited node to understand the frame's children and overall structure. Avoid calling `get_design_context` on huge canvas-level nodes — the response can exceed token limits.
3. Call `mcp__figma__get_design_context` on the relevant frame to get the actual rendered layout: positions of elements, flex direction, alignment, gaps, typography variants, and which states/components are inline vs. stacked.
4. Note dimensions, sizes, theme tokens (e.g. `baseShade3`, `secondaryShade4`), typography variants (`TitleBold`, `BodyBold`, `Caption`), and states that the spec implies. Pay attention to **where** an element sits in the layout (e.g. inline in a header row vs. stacked below) — the Jira description often describes behavior but the Figma is the truth for placement.

If no Figma URL is in the ticket, ask the user **once** via `AskUserQuestion`:

| Option                | Effect                                                |
| --------------------- | ----------------------------------------------------- |
| Provide Figma link    | User pastes a URL; skill fetches it and continues.    |
| Proceed without Figma | Skill uses Jira description alone as source of truth. |
| Cancel                | Stop the skill.                                       |

Do not block the workflow on a missing Figma — many QA bugs are pure regressions with no design reference.

## Stage 1 — Read the current code

Open the files the ticket implicates. Source lives under `src/core/` (shared infrastructure: hooks, providers, stores, utils, types) and `src/social/` (components, elements, screens, features). Use `grep` to find the relevant component, hook, or screen. Do not skim — read enough to identify the actual defect.

## Stage 1 — Synthesize

Write the user a short **expected vs. actual** summary in chat (5–10 lines):

- **Expected** (per Jira description + Figma, if any): what the ticket says should happen.
- **Actual** (per current code): what the code does today and where the gap is.
- **Hypothesised root cause**: one sentence.

Do **not** persist this summary to a file — plan mode in Stage 2 handles persistence.

---

# Stage 2 — Plan + approval gate

## Stage 2 — Enumerate root causes and fix approaches first

**Before writing the plan, brainstorm.** A QA bug rarely has a single obvious fix — and the first idea is often not the cleanest. In chat (briefly, before entering plan mode), enumerate:

1. **All plausible root causes** — not just the most obvious. For a "stuck modal" bug, that could be: SDK hangs, React Query pauses, missing error handler, missing network guard, race condition in confirm provider, etc. Read the relevant code paths thoroughly enough to rule causes in or out.

2. **All plausible fix approaches** for the most-likely root cause. Examples of categories to consider:

   - **Library-native primitive** (e.g. React Query's `networkMode: 'always'`, AbortController, error boundary) — usually the cleanest, look for it first by grepping the codebase for similar usage.
   - **Local guard** (e.g. pre-check `useNetInfo()` and short-circuit).
   - **Timeout / race** (wrap the hanging call).
   - **Optimistic / background** (close the modal immediately, surface errors via toast).
   - **Prevent the action entirely** (disable the button when the precondition fails).
   - **Combination** (e.g. pre-check + timeout safety net).

3. **Evaluate trade-offs** for each: complexity, robustness, UX, alignment with existing patterns in the repo. **Prefer the approach that matches an established codebase pattern** — `grep` for similar fixes before inventing a new one.

4. If two or three approaches are roughly equivalent, **surface the choice to the user via `AskUserQuestion`** before drafting the plan. The user often has context (existing conventions, future direction, design intent) that makes one option clearly better.

Only once the approach is settled — either confidently by you, or explicitly by the user — write the plan. **The plan contains only the chosen approach**, not the alternatives. Alternatives are conversational, not persisted.

Skip the enumeration only if the fix is genuinely one obvious line (e.g. typo, missing prop, off-by-one). Otherwise enumerate — it is cheap and prevents the user from pushing back with "any other workarounds?" after you've already committed to an approach.

## Stage 2 — Write the plan

Enter plan mode. Draft a fix plan covering:

1. **Root cause** — one paragraph, citing file paths and line ranges. State what was ruled in vs. ruled out during enumeration.
2. **Files to change** — explicit paths, with one-line description per file.
3. **Reusable utilities / components leveraged** — per the [`features`](../features/SKILL.md) skill rules. Check `src/core/` and `src/social/elements/` before proposing new code. Cite the file paths of the established pattern you're following.
4. **L10n impact** — if the fix touches strings, list the keys. Net-new l10n keys require user approval; pre-allocated empty keys may be populated freely.
5. **Manual QA steps** — how the user will verify the fix locally (run the example app via `yarn example ios` / `yarn example android`, then describe the interaction sequence).

Call `ExitPlanMode` to request approval. **Do not proceed past this stage without explicit approval.** If the user requests changes, revise the plan in place and ask again.

---

# Stage 3 — Branch + implement

## Stage 3 — Choose the base branch

Ask the user via `AskUserQuestion`:

| Option                                           | When                                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Current feature/integration branch (Recommended) | QA tickets filed against an active milestone (e.g. `main-v4`, `main-dev-v4`) — PR targets the integration branch. |
| `main`                                           | Bug also affects production / already-released code.                                                              |
| Other (specify)                                  | User names the branch.                                                                                            |

Confirm with `git status` that the working tree is clean. If it is dirty, stop and ask the user how to proceed — do not stash, do not discard.

## Stage 3 — Branch naming

Format: `fix/PDT-<num>-<slug>` for `Bug` issue type, `feat/PDT-<num>-<slug>` otherwise.

Keep `<slug>` **short and meaningful** (3–6 words). Strip filler like `[RN UIKit Social 4.0]`, "should", "no" prefixes, and Jira tag noise. The slug is for humans to scan a branch list — capture the essence, not the full Jira title.

1. Identify the 3–6 most descriptive words from the title (the actual subject of the bug).
2. Lowercase, replace non-alphanumerics with `-`, collapse runs, trim.

Examples:

- Title `[RN UIKit Social 4.0] user profile crash on null avatar` + key `PDT-2777` → `fix/PDT-2777-profile-null-avatar-crash`
- Title `[RN UIKit Social 4.0] Add notification settings screen` + key `PDT-2729` → `feat/PDT-2729-notification-settings`

If unsure, pick the shorter version. Do not mechanically truncate the full title — it produces ugly, hard-to-read branch names.

Run:

```bash
git checkout <base-branch>
git pull --ff-only
git checkout -b <branch>
```

## Stage 3 — Implement

For any change inside `src/`, **invoke the [`features`](../features/SKILL.md) skill** so its conventions apply automatically:

- Use the canonical folder layout: a component lives at `ComponentName/ComponentName.tsx` with `index.tsx` (barrel) and `styles.ts` (`useStyles` hook).
- Place new code in the most specific bucket:
  - `elements/` for atomic, nearly stateless UI (buttons, badges, action rows).
  - `components/` for composed UI without business logic.
  - `features/<domain>/` for feature sub-views combining UI + data-fetching/state.
  - `screens/` for full navigation pages.
- Theme tokens come from the project's design-system map (e.g. `baseShade3`, `secondaryShade4`) — never raw hex colors.
- Typography uses the project's `Typography` variants (`TitleBold`, `BodyBold`, `Caption`).
- Centralize new shared enums/types in `src/social/types/index.ts`; use `PascalCase` names without `Amity` prefix internally, `camelCase` for values.
- Register screens via `src/core/routes/RouteParamList.tsx` + `src/core/routes/AmityUIKitNavigator.tsx`; export from `src/social/screens/index.ts` and `src/social/index.tsx` with the `Amity` prefix convention.
- Hook param types derived from SDK signatures via `Parameters<typeof SDK_FN>[N]` rather than copy-pasting older `string` patterns.

For any change outside `src/` (build config, docs, native projects), apply the change directly — `features` does not apply.

## Stage 3 — Verify against Figma after implementation

For any visual fix, **re-open the Figma frame** after editing and cross-check layout/alignment/centering — not just functionality. Common gaps from the Jira description alone:

- The Jira description tells you _what_ should appear; the Figma tells you _where_ it sits (inline vs. stacked, centered vs. left-aligned, in the header vs. as a separate block).
- If the Figma shows three sibling regions in a row (e.g. title / status / actions), match its flex sizing — typically both outer regions get equal `flex: 1` and the middle region uses a fixed width / `flexShrink: 0` so it stays centered.

Iterate on layout until it matches the spec. Do not assume Jira description and Figma agree on placement.

## Stage 3 — Post-implement checks

Run in parallel:

```bash
yarn typecheck
yarn lint
```

If either fails, surface the error to the user verbatim. Do not silently ignore. Fix the failures before moving to Stage 4.

## Stage 3 — Reporting changes back to the user

**Always lead with the file paths AND show the diff.** Whenever you finish a step — initial implementation, a refactor, a layout fix — your response must contain:

1. A bulleted list of the absolute or repo-relative paths of every file you created or modified, **at the top of the response**.
2. The actual diff of each change, rendered inline via `git diff` (or `git diff HEAD~1 HEAD` after a commit). Run the diff command in a `Bash` call so the panel renders the change visibly. Never describe a change in prose without also showing the diff — the user expects to see the code, not just hear about it.

This applies on **every** report in Stage 3 (after the first implementation, after each refactor pass, after each user-requested adjustment) and on the Stage 4 handoff. Do not wait for the user to ask "where is the change" — surface it proactively in the panel.

If you split your work into a new element/component folder, list every file in that folder (the `.tsx`, the `styles.ts`, the `index.tsx`) plus any consumer-side wiring (the parent component that imports it, route registration, and any barrel re-export). For new files where `git diff` would not show contents until staged, use `git diff --no-index /dev/null <new-file>` or stage them first and then `git diff --cached`.

---

# Stage 4 — Manual QA gate

Print a handoff summary with the file list at the very top:

1. **Files touched** — list every created/modified path as a plain bulleted list. This is the first thing the user reads. Do not put it after the verification steps.
2. **How to reproduce the fix locally** — describe in-app steps after running `yarn example ios` or `yarn example android` (the example app under `example/`).
3. **Acceptance check** — restate each acceptance criterion from the ticket and mark which is now satisfied.

Ask the user via `AskUserQuestion`:

| Option        | Effect                                                        |
| ------------- | ------------------------------------------------------------- |
| Ok to commit  | Proceed to Stage 5.                                           |
| Needs changes | User describes what; skill loops back into Stage 3 implement. |
| Cancel        | Stop without committing.                                      |

**Do not commit until the user picks "Ok to commit".**

---

# Stage 5 — Build + commit + push

## Stage 5 — Re-read the diff

**Always run `git diff` before staging**, even if you just showed the diff at Stage 3. The user may have edited files during Stage 4 QA (e.g. removing debug logs, adjusting logic after manual testing). Never commit based on a diff you saw earlier — verify the actual current state.

```bash
git diff
```

If the diff has changed from what was implemented in Stage 3:

1. Read any files the user touched.
2. Verify the change is intentional and correct.
3. If you spot debug statements (`console.log`, `console.error`, `console.warn`, `debugger`), remove them before proceeding — do not commit debug code.

## Stage 5 — Final build gate

Run:

```bash
yarn typecheck
yarn lint
```

If either fails, **stop**. Surface the error to the user verbatim. Do not stage, commit, or push. This is the precondition for a push — it catches anything that crept in after Stage 3.

Optionally (slower, only if a library publish is implied or the user requests): `yarn prepack` runs `bob build` and produces the consumable `lib/` output. Treat a build failure the same way — stop and report.

## Stage 5 — Stage changes

Always use `git add -A` to stage every modified file. If something shouldn't be included, revert it rather than skipping the stage step:

```bash
git add -A
```

## Stage 5 — Commit

Determine the commit verb from the Jira issue type captured in Stage 1:

- `Bug` → `fix:`
- `Task` / `Story` / anything else → `feat:`

**Keep the commit message simple and short — single line, no body, no Co-Authored-By footer.** The user prefers terse, scannable history that matches the repo style (e.g. `feat: PDT-2517 - notification settings screen`).

Format:

```
<verb>: PDT-<num> - <short summary>
```

Use a single `-m` flag — no HEREDOC needed since there is no body. The Jira key in the subject is the entire audit trail; descriptive content lives on the Jira ticket and the PR description, not in the commit body.

If the pre-commit hook (lefthook / lint-staged) fails, fix the issue and create a **new** commit. Never `--amend` after a failed hook — that modifies the previous commit.

## Stage 5 — Push

```bash
git push -u origin <branch>
```

## Stage 5 — Print compare URL

Print the GitHub compare URL as a **clickable markdown link**:

```
[compare/<base>...<branch>](https://github.com/AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource/compare/<base>...<branch>)
```

The `<base>` is **always the branch chosen in Stage 3** (the branch we created from). Never default to `main` if the user picked an integration branch — the PR target must match the base. Always PR back to the base branch we branched from.

## Stage 5 — Create the PR

After printing the compare URL, **ask the user via `AskUserQuestion`** whether to open the PR. Do not auto-create — the user reviews the compare diff first, then approves.

| Option    | Effect                                                  |
| --------- | ------------------------------------------------------- |
| Create PR | Skill runs `gh pr create` with the conventions below.   |
| Skip      | Stop after the compare URL; user opens the PR manually. |

Only proceed past this gate if the user picks "Create PR".

**Conventions:**

- **Title:** identical to the commit subject — `<verb>: PDT-<num> - <short summary>` (e.g. `fix: PDT-2985 - too many users mentioned alert on post composer`). Match the existing repo PR titles.
- **Base branch:** the same base used in Stage 3. Never default to `main`.
- **Reviewers:** `ChayanitBm`, `pitchaya-sp` (default team reviewers).
- **Assignee:** `@me` (the user creating the PR).
- **Body:** read `.github/pull_request_template.md` and fill in each section. Use a HEREDOC so multi-line content renders correctly.

**Filling the template:**

- `**Jira ticket :**` → full URL to the ticket (`https://socialplus.atlassian.net/browse/PDT-<num>`).
- `**Description :**` → 2–4 sentence summary of the root cause and the fix. Bullet-list multi-file changes. Use backslash-escaped backticks (`\``) inside the HEREDOC so inline code formats correctly. Do not paste the full plan or commit body — keep it scannable.
- `**Check lists :**` → leave all three boxes **checked** (`- [x]`) by default, since the skill runs `yarn typecheck` + `yarn lint` and the user manually QA'd in Stage 4.
- `**Screen shot :**` → leave empty (header only). User adds screenshots manually if needed.
- `**Note (optional) :**` → leave empty (header only). Do not add anything here unless the user asks for it — out-of-scope notes belong in the description, not here.

**Command shape:**

```bash
gh pr create \
  --repo AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource \
  --base <base-branch-from-Stage-3> \
  --head <branch> \
  --title "<commit subject>" \
  --reviewer ChayanitBm,pitchaya-sp \
  --assignee @me \
  --body "$(cat <<'EOF'
**Jira ticket :** https://socialplus.atlassian.net/browse/PDT-<num>

**Description :**

<2-4 sentence summary + bullet list of changes>

**Check lists :**

- [x] Test code
- [x] Build local pass (optional)
- [x] Code is the same level as origin/develop branch

**Screen shot :**

**Note (optional) :**
EOF
)"
```

Print the returned PR URL to the user as a clickable markdown link. Then stop.

---

# Stage 6 — Optional: Jira status transition

If after Stage 1 the user decides the ticket needs **no code change** (existing behavior is intentional, fix would be too disruptive, etc.), skip Stages 2–5 and instead:

1. Ask the user whether to transition the Jira ticket. If yes, use `mcp__claude_ai_Atlassian__getTransitionsForJiraIssue` to list available transitions, then `transitionJiraIssue` with the chosen ID. Typical target after a "won't fix as filed" decision is **Deployed to Dev** (status id varies per workflow — read it from the transitions list, do not hardcode).
2. Confirm to the user the ticket status changed. Stop.

For the normal code-fix flow, the user typically transitions the ticket themselves after the PR merges and the build deploys — do not auto-transition after `git push`.

---

# Verification

To dry-run this skill on a real ticket:

1. Paste a real PDT Jira URL. Confirm Stage 1 fetches the ticket and (if linked) the Figma frame.
2. Confirm Stage 2 enters plan mode and `ExitPlanMode` pauses for approval.
3. Approve a small change; confirm Stage 3 creates a branch named `fix/PDT-<num>-<slug>` (or `feat/...`) off the chosen base, and `yarn typecheck` + `yarn lint` run after the edits.
4. Confirm Stage 4 stops at the QA gate and does not auto-commit.
5. After approving the QA gate, confirm `yarn typecheck` + `yarn lint` run before staging happens; if either fails, the skill stops.
6. Confirm the commit message is the **single-line** form `<verb>: PDT-<num> - <summary>` (no body, no Co-Authored-By footer) and `git push -u origin <branch>` runs.
7. Confirm the printed compare URL targets the base branch chosen in Stage 3 (not `main`).

If any stage skips its gate, applies the wrong conventions, or misnames the branch, update this `SKILL.md` rather than working around it inline.
