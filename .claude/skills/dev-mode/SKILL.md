---
name: dev-mode
description: Use ONLY when the user explicitly invokes this skill by name (e.g. "/dev-mode", "run dev-mode", "dev mode with <Jira URL>") to perform a one-shot clean rebuild and launch of the example app in the Amity Social UIKit React Native (CLI) repo. Do NOT auto-trigger on a pasted Jira URL alone — Jira URLs without explicit dev-mode invocation belong to the issue-resolver skill.
---

# Dev Mode

One-shot **clean → install → build → run** of the example app, intended to be invoked by the user before manual QA of a feature or QA-filed ticket. After it succeeds once on a branch, the user should not re-run it for the same branch — re-cleaning destroys the warmed native build caches and wastes time.

## When to use

Invoke only when the user explicitly asks for it. Accepted forms:

- `/dev-mode <Jira URL or PDT-XXXX>` — verify branch matches the ticket, then run.
- `/dev-mode` (no argument) — skip ticket-to-branch verification; just confirm current branch with the user.
- Phrases like "run dev-mode", "dev mode this", "clean rebuild + run example app", "reset and run example app".

**Do not** invoke this skill:

- When the user pastes a Jira URL without naming this skill — that flow belongs to [issue-resolver](../issue-resolver/SKILL.md).
- For code changes — this skill never edits source files. It only manages the local build environment.
- To re-run on the same branch after a successful prior run, unless the user explicitly asks for it (warn first; see Stage 5).

## Stage 1 — Verify branch

Run `git status` and `git rev-parse --abbrev-ref HEAD`.

If the user provided a Jira URL or PDT key:

1. Parse the ticket key with regex `PDT-\d+`.
2. If the current branch name does **not** contain that key, **stop** and surface the mismatch to the user. Ask via `AskUserQuestion` whether to (a) switch to a different branch (user names it), (b) continue on the current branch anyway, or (c) cancel. Never auto-switch.

If no ticket key was supplied, just print the current branch and confirm with the user before continuing.

If the working tree is dirty, surface it. The clean step below only removes ignored/native artifacts — it will not touch tracked changes — so dirty is usually safe, but the user should be aware.

## Stage 2 — Choose platform

Ask via `AskUserQuestion`:

| Option             | Effect                                              |
| ------------------ | --------------------------------------------------- |
| Both (Recommended) | Clean + build + run iOS and Android, in that order. |
| iOS only           | Skip all Android steps.                             |
| Android only       | Skip all iOS steps.                                 |
| Cancel             | Stop the skill.                                     |

Store the choice for the remaining stages.

## Stage 3 — Clean

Remove the following paths. Paths that don't exist are not an error — use `rm -rf` so the command is idempotent. Independent removes can run in a single `Bash` call.

Always (any platform):

```bash
rm -rf node_modules example/node_modules
```

If iOS selected:

```bash
rm -rf example/ios/Pods example/ios/build
```

If Android selected:

```bash
rm -rf example/android/build \
       example/android/.gradle \
       example/android/.kotlin \
       example/android/app/.cxx \
       example/android/app/build
```

Confirm to the user in one line what was cleaned before continuing.

## Stage 4 — Install + native build

Run sequentially in this exact order. Use a long timeout (`timeout: 600000`) on each step — pod install with `--repo-update` and `assembleDebug` can each take many minutes on a cold cache. If a step fails, **stop** and surface stderr verbatim; do not continue to the next step or to Stage 5.

**IMPORTANT — always use absolute paths.** Shell state does NOT persist between Bash tool calls (each call gets a fresh shell). Never rely on a `cd` from a previous call; always prefix commands with the full repo path.

1. **Root JS deps** (always) — run from repo root:

   ```bash
   cd "/absolute/path/to/repo" && yarn
   ```

   Note: `yarn` postinstall automatically runs `pod install` (without `--repo-update`). If it fails due to a path-encoding error (see below), that is expected — proceed to step 2 which runs pod install directly with the correct locale.

2. **iOS native deps** (if iOS selected):

   ```bash
   cd "/absolute/path/to/repo/example/ios" && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install --repo-update
   ```

   The `LANG`/`LC_ALL` prefix is required when the repo path contains non-ASCII characters (e.g. `Social+`). Without it, CocoaPods throws `Unicode Normalization not appropriate for ASCII-8BIT`.

3. **Android native build** (if Android selected):
   ```bash
   cd "/absolute/path/to/repo/example/android" && ./gradlew clean && ./gradlew assembleDebug
   ```
   `./gradlew clean` then `./gradlew assembleDebug` — chain with `&&` so a clean failure aborts the build.

When both platforms are selected, run iOS step 2 before Android step 3, sequentially. Don't parallelize — they compete for CPU and obscure failure attribution.

## Stage 5 — Launch the example app

Run the launch commands with `run_in_background: true` so Metro and the platform CLI keep running after the tool call returns. Each command starts Metro plus the platform's run-tool.

If iOS selected:

```bash
cd "/absolute/path/to/repo/example" && yarn ios --simulator "iPhone 16 Pro"
```

If Android selected:

```bash
cd "/absolute/path/to/repo/example" && yarn android
```

When both are selected, launch iOS first (background), then Android (background). Each gets its own Metro process; that is expected behavior for this repo's example app.

After launching, print a one-line confirmation to the user:

> Example app launched on <platform(s)>. Re-running dev-mode on this branch wipes the warm native cache — only do it if you switched branches or hit a stale-cache problem.

Then stop. Do not poll the background processes; the user observes the simulator/emulator directly.

## Re-running on the same branch

If the user invokes the skill again on a branch where a previous successful run is plausible (same session, or no branch switch since), ask via `AskUserQuestion` first:

| Option               | When                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Cancel (Recommended) | Default — the warm cache is valuable, prefer `yarn start` + simulator restart for most issues.                        |
| Full re-clean        | The user hit a native-cache problem (Pods drift, Gradle daemon lockup, missing arch) that only a clean rebuild fixes. |

Only proceed past Stage 2 if the user picks "Full re-clean".

---

## Out of scope

This skill does not:

- Edit source files, commit, or push.
- Run `yarn typecheck` / `yarn lint` (the `issue-resolver` skill handles that on its own gates).
- Manage Metro processes between runs — the user kills lingering Metro shells themselves if needed.
- Choose a simulator other than `iPhone 16 Pro` for iOS. If the user wants a different simulator, they pass it as a follow-up adjustment and the skill substitutes it into the Stage 5 command verbatim.
