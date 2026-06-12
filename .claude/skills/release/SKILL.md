---
name: release
description: 'Release React Native UIKit (@amityco/react-native-social-uikit) to NPM. Use when: "release uikit react native", "release react native uikit", "publish react native uikit", "release rn uikit to npm", "release uikit rn".'
argument-hint: 'Specify the version bump options: release_as (major/minor/patch/stable/none) and pre-release (RC/alpha/beta/none)'
---

# Release React Native UIKit (`@amityco/react-native-social-uikit`)

**Repository:** https://github.com/AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource
**NPM:** https://www.npmjs.com/package/@amityco/react-native-social-uikit
**GitHub Action:** https://github.com/AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource/actions/workflows/production.yaml

## Pre-Release

> **IMPORTANT:** Before releasing, tag the person giving the green light and get them to acknowledge the message prior to releasing. Better safe than sorry.

- Ask the user for the version bump options:
  - `release_as`: `major` / `minor` / `patch` / `stable` / `none`
  - `pre-release`: `RC` / `alpha` / `beta` / `none`
- Confirm PO has given approval.

### Version bump examples

| Goal              | release_as | pre-release | Result example                |
| ----------------- | ---------- | ----------- | ----------------------------- |
| Next RC           | `none`     | `RC`        | `4.0.0-RC.21` → `4.0.0-RC.22` |
| Promote to stable | `stable`   | `none`      | `4.0.0-RC.22` → `4.0.0`       |
| Minor pre-release | `minor`    | `RC`        | `4.0.0` → `4.1.0-RC.1`        |
| Patch stable      | `patch`    | `none`      | `4.0.0` → `4.0.1`             |

## Procedure

### 1 — Merge all feature PRs into `production`

Ensure all feature PRs for this release are merged into the `production` branch before creating the release branch.

```sh
gh pr list --repo AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource --base production --state open
```

If there are open feature PRs that should be included, ask the user to merge them first.

### 2 — Check out the `production` branch and sync

```sh
git checkout production
git fetch origin
git pull origin production
```

### 3 — Create a new release branch

Branch name pattern: `release/v<VERSION>` (e.g. `release/v4.0.0-RC.22`)

Ask the user for the target version string if not already provided, then:

```sh
git checkout -b release/v<VERSION>
git push -u origin release/v<VERSION>
```

### 4 — Trigger the GitHub Action

#### Option A — GitHub CLI (recommended)

Trigger the workflow directly from the terminal without needing the UI button:

```sh
gh workflow run production.yaml \
  --repo AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource \
  --ref release/v<VERSION> \
  -f release_as=<release_as> \
  -f "pre-release=<pre-release>"
```

Then watch the run:

```sh
gh run watch --repo AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource
```

> **Note:** The **Run workflow** button in the GitHub UI only appears when `workflow_dispatch` exists on the **default branch** (`production`). If the button is missing, use the CLI approach above instead.

#### Option B — GitHub Actions UI

Go to **GitHub Actions → Production release pipeline** and click **Run workflow**:

- **Branch:** select your new `release/v<VERSION>` branch
- **release_as:** `major` / `minor` / `patch` / `stable` / `none`
- **pre-release:** `RC` / `alpha` / `beta` / `none`

URL: https://github.com/AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource/actions/workflows/production.yaml

The pipeline will automatically:

1. Bump the version in `package.json` and update `CHANGELOG.md`
2. Build the library (`yarn prepack`)
3. Run tests (`yarn test`)
4. Publish the package to npm (`npm publish --access public`)
5. Push the version commit and tag back to the branch (`git push --follow-tags`)

Wait for the workflow to complete successfully before proceeding.

### 5 — Verify the published version on NPM

```sh
npm view @amityco/react-native-social-uikit version
```

Confirm the published version matches the expected new version.

### 6 — Merge the release branch into `production`

Once the pipeline completes and the version is confirmed on NPM, open a PR from the release branch into `production` and merge it.

```sh
gh pr create \
  --repo AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource \
  --base production \
  --head release/v<VERSION> \
  --title "chore: release v<VERSION>" \
  --body "Merging release branch after successful publish of v<VERSION> to npm."
```

Or merge directly if permitted:

```sh
git checkout production
git pull origin production
git merge release/v<VERSION>
git push origin production
```

### 7 — Done

Announce the release in the appropriate Slack channel or team thread, referencing the npm package and the GitHub tag.
