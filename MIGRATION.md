# Migration Guide

This document describes how to upgrade host apps from the previous production RC release (4.x-RC) to the official release (4.0.0).

This is a **major upgrade**. Read this document in full before bumping the package.

## Base requirement bumps

| Tool                               | Old (4.x)                          | New                                                          |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Node                               | ≥16                                | **≥20** (this repo uses 20.19.4)                             |
| React                              | 18.3.1                             | **19.1.1**                                                   |
| React Native                       | 0.77.0                             | **0.82.1**                                                   |
| TypeScript                         | ^5.2.2                             | **^5.8.3**                                                   |
| Android `compileSdk` / `targetSdk` | 35 / 34                            | **36 / 36**                                                  |
| Android `buildToolsVersion`        | 35.0.0                             | **36.0.0**                                                   |
| Android `kotlinVersion`            | 2.0.21                             | **2.1.20**                                                   |
| Android JSC artifact               | `org.webkit:android-jsc:+`         | **`io.github.react-native-community:jsc-android:2026004.+`** |
| iOS deployment target              | `min_ios_version_supported` (15.1) | unchanged                                                    |
| JDK / Ruby / Xcode                 | 17 / 3.2.0 / 15                    | unchanged                                                    |

## Peer dependency changes

Update your host app's `package.json` to match.

### New peers (add these)

| Package                             | Version   |
| ----------------------------------- | --------- |
| `@react-native-clipboard/clipboard` | `^1.16.3` |
| `react-native-haptic-feedback`      | `^2.3.3`  |

### Bumps (update existing)

| Package                          | Old (4.x) | New                          |
| -------------------------------- | --------- | ---------------------------- |
| `@amityco/ts-sdk-react-native`   | `^7.17.0` | `7.18.1-72bd324a.0` (pinned) |
| `react-native-safe-area-context` | `5.2.0`   | `^5.6.2`                     |
| `react-native-screens`           | `4.8.0`   | `^4.18.0`                    |
| `react-native-svg`               | `15.11.1` | `^15.15.1`                   |
| `react-native-video`             | `^6.16.1` | `^6.18.0`                    |
| `react-native-vision-camera`     | `^4.7.1`  | `^4.7.3`                     |

Other peers (`@react-native-async-storage/async-storage`, `react-native-gesture-handler`, Firebase, navigation, livekit) are unchanged.

## Public-API changes

- The legacy `src/v4/*` source tree was removed and re-organized under `src/core/*` and `src/social/*`. Components such as `AmityPageRenderer`, `AmityUiKitSocial`, `PostDetail`, `CommunityHome`, `UserProfile`, etc. are still exported from the package root (`@amityco/react-native-social-uikit`). **Deep imports targeting `…/lib/typescript/v4/...` will break** — switch to root imports.
- `navigate` is now a public export (programmatic navigation helper).
- `AmityUserProfilePage` was removed from the public surface; the new community/user navigation is reached through `AmityUiKitSocial`.

## Internal restructure (informational)

- `src/v4/*`, `src/components/*`, and `src/screens/*` legacy trees were removed.
- `tsconfig.json` switched `jsx` from `react` → `react-jsx` (new automatic JSX runtime) and dropped the `~/*` path alias. Consumers don't need to change anything.
- The `BackHandler.removeEventListener` polyfill in `src/index.tsx` was kept — older third-party libs like `react-native-modalbox` continue to work without intervention.

## Migration checklist for host-app engineers

1. Pin Node ≥20 in your CI / `.nvmrc`.
2. Run `npx react-native upgrade 0.82.1` in your host app and resolve template diffs.
3. In `android/build.gradle` bump `compileSdkVersion`/`targetSdkVersion` to **36**, `buildToolsVersion` to **36.0.0**, `kotlinVersion` to **2.1.20**.
4. In `android/app/build.gradle` change `jscFlavor` to `'io.github.react-native-community:jsc-android:2026004.+'`.
5. Update `package.json` per the **Peer dependency changes** tables; run `yarn` (or `npm install`), then `cd ios && pod install`.
6. Replace any deep imports from `@amityco/react-native-social-uikit/lib/typescript/v4/...` with root-package imports.
7. Test push notifications — Firebase deps unchanged, but Android SDK 36 may require additional `FOREGROUND_SERVICE_*` manifest entries on Android 14+.
8. Smoke-test livestream (livekit) on a physical Android device — Kotlin 2.1 + Android 36 build path is new.
