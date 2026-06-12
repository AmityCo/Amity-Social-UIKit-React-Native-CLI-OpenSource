# Release Documentation

## Overview

This repository uses **GitHub Actions** for automated testing, building, and publishing the `@amityco/react-native-social-uikit` package to npm across different environments.

---

## Workflows

### 1. Development Pipeline ([dev.yaml](.github/workflows/dev.yaml))

**Trigger:** Pull requests targeting the `production` branch

**What it does:** Publishes development versions for testing before merging

**Publishing:**

- Dist Tag: `dev/<PR_NUMBER>`
- Version Pattern: `<version>-<commit-sha>` (e.g., `4.0.0-RC7-abc1234`)
- Installation: `npm install @amityco/react-native-social-uikit@dev/123`

**Conditions:**

- Automatically unpublishes previous dev/{PR_NO} version
- Uses commit SHA for unique versioning

### 2. Staging Pipeline ([staging.yaml](.github/workflows/staging.yaml))

**Trigger:** Push to `production` branch (usually when PR is merged)

**What it does:** Creates nightly builds from the production branch

**Publishing:**

- Dist Tag: `nightly`
- Version Pattern: `<version>-<commit-sha>` (e.g., `4.0.0-RC7-def5678`)
- Installation: `npm install @amityco/react-native-social-uikit@nightly`

**Conditions:**

- Automatically unpublishes previous nightly version
- Uses commit SHA for unique versioning

---

### 3. Production Pipeline ([production.yaml](.github/workflows/production.yaml))

**Trigger:** Git tags matching pattern `v*` (e.g., `v4.0.0`, `v4.0.1`)

**What it does:** Official production releases to npm

**Publishing:**

- Dist Tag: `latest` (default)
- Version Pattern: Semantic versioning from tag (e.g., `4.0.0`)
- Installation: `npm install @amityco/react-native-social-uikit`

**Conditions:**

- Uses version from git tag

---

### 4. Unit Testing ([unit_testing.yaml](.github/workflows/unit_testing.yaml))

**Trigger:** Push to `production` branch

**What it does:** Runs unit tests to ensure code quality on the production branch

---

### 5. Release Label Check ([check_release_label.yaml](.github/workflows/check_release_label.yaml))

**Trigger:** Pull request events (opened, edited, labeled, unlabeled, etc.)

**What it does:** Ensures all PRs have a release label before merging

**Required Label Pattern:** Must start with `Release/` (e.g., `Release/Major`, `Release/Minor`, `Release/Patch`)

---

### 6. Do Not Merge Check ([check_do_not_merge.yaml](.github/workflows/check_do_not_merge.yaml))

**Trigger:** Pull request events (opened, edited, labeled, unlabeled, etc.)

**What it does:** Blocks merging of PRs labeled with `DO NOT MERGE`

---

## How to Publish

### Development Version (Testing in PR)

1. Open a pull request to `production` branch
2. Add a `Release/*` label to your PR
3. Push your changes
4. The [dev.yaml](.github/workflows/dev.yaml) workflow automatically:
   - Builds the package
   - Creates version: `<current>-<commit-sha>`
   - Publishes to npm with tag: `dev/<PR_NUMBER>`

**Install the dev version:**

```bash
npm install @amityco/react-native-social-uikit@dev/123
# Replace 123 with your PR number
```

---

### Nightly Version (Latest from Production Branch)

1. Merge your PR to `production` branch
2. The [staging.yaml](.github/workflows/staging.yaml) workflow automatically:
   - Builds the package
   - Creates version: `<current>-<commit-sha>`
   - Publishes to npm with tag: `nightly`

**Install the nightly version:**

```bash
npm install @amityco/react-native-social-uikit@nightly
```

---

### Production Version (Official Release)

1. Ensure your changes are merged to `production` branch
2. Create and push a git tag with version:

```bash
git tag v4.0.1
git push origin v4.0.1
```

3. The [production.yaml](.github/workflows/production.yaml) workflow automatically:
   - Runs tests (must pass)
   - Builds the package
   - Publishes to npm with tag: `latest`

**Install the production version:**

```bash
npm install @amityco/react-native-social-uikit
# or specify version
npm install @amityco/react-native-social-uikit@4.0.1
```

---

## Release Flow Diagram

```md
┌─────────────────────┐
│ Open PR │
│ (to production) │
└──────────┬──────────┘
│
├──► Add Release/\* label (required)
├──► Push commits
└──► Auto-publishes: @dev/<PR_NUMBER>
│
▼
┌─────────────────┐
│ Merge PR │
└────────┬────────┘
│
└──► Auto-publishes: @nightly
│
▼
┌─────────────────┐
│ Create Git Tag │
│ (v4.0.1) │
└────────┬────────┘
│
└──► Auto-publishes: @latest
```

---

## Required GitHub Secrets

Configure these secrets in **Settings** → **Secrets and variables** → **Actions**:

| Secret Name    | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `NPM_TOKEN`    | npm authentication for publishing packages          |
| `GITHUB_TOKEN` | GitHub API authentication (auto-provided by GitHub) |

---

## Version Strategy

| Environment     | Version Pattern           | Dist Tag          | Example             |
| --------------- | ------------------------- | ----------------- | ------------------- |
| **Development** | `<version>-<commit-sha>`  | `dev/<PR_NUMBER>` | `4.0.0-RC7-abc1234` |
| **Staging**     | `<version>-<commit-sha>`  | `nightly`         | `4.0.0-RC7-def5678` |
| **Production**  | `<major>.<minor>.<patch>` | `latest`          | `4.0.1`             |

---

## Best Practices

### For Developers

1. Always add a `Release/*` label to your PR
2. Test your changes using dev versions: `npm install @amityco/react-native-social-uikit@dev/<PR_NUMBER>`
3. Run tests locally before pushing: `yarn test`
4. Run build locally before pushing: `yarn prepack`

### For Releases

1. Merge feature PRs into the `staging` branch
2. Bump version in `/package.json` on the `staging` branch
3. Commit and push the version bump
4. Create a pull request from `staging` to `production` branch
5. Create a version tag (e.g., `v4.0.0-RC1`)
6. Create a release using the version tag
7. Add release notes summarizing the key changes
8. Check the updated version in npm package

---

**Last Updated:** 2025-12-18
**Maintained By:** Social React Native Engineering Team
