# Amity React Native Social UIKit — Engineering Guide

This guide helps client-side engineers understand how the UIKit is structured, where to extend it, and how it integrates with native layers. Pair it with the public README for installation steps.

## Architecture

- **Library target:** The entire repo `amity-react-native-social-ui-kit` is a React Native CLI project that exports UIKit library prebuilt with social features.
- **Sample app:** `/example` folder is a sample with **Entry point** which demonstrates integration, Firebase push notifications, and UIKit configuration overrides.
- **State & data:** Combines `Redux Toolkit` stores (under `src/redux`) with `React Query` for server caching and the Amity TS SDK for network operations.

## Project Layout & Responsibilities

Even though the UIKit project is still supporting v3 and v4, you can focus folders under `/v4` only. The folder structure is nearly the same with the recommended docs.

| Path                   | Purpose                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/index.tsx`        | Top-level export surface; ensures backward compatibility (BackHandler polyfill) and re-exports public atoms. |
| `src/v4/`              | Core UIKit implementation for version 4 (navigators, screens, feature modules, public APIs).                 |
| `src/v4/assets/`       | Packaged icons, illustrations, and static imagery consumed across the experience.                            |
| `src/v4/component/`    | Cross-feature React components reused throughout the UIKit.                                                  |
| `src/v4/configAssets/` | Theme and localization asset maps consumed by the config system.                                             |
| `src/v4/constants/`    | Shared constant values (colors, feature flags, copy keys).                                                   |
| `src/v4/core/`         | Core business logic and base orchestration classes.                                                          |
| `src/v4/elements/`     | Low-level UI primitives that power higher-level components.                                                  |
| `src/v4/engine/`       | Rendering utilities and supporting engines (e.g., stories).                                                  |
| `src/v4/enum/`         | Shared enumerations available to every feature module.                                                       |
| `src/v4/features/`     | Feature domains (feeds, stories, community, etc.) grouped by responsibility.                                 |
| `src/v4/hook/`         | Reusable hooks bridging the Amity SDK, storage, and UI concerns.                                             |
| `src/v4/providers/`    | Context providers (auth, config, media, user) applied globally.                                              |
| `src/v4/PublicApi/`    | Public pages and components safe to consume as standalone modules.                                           |
| `src/v4/routes/`       | Navigation stacks, independent navigators, and route helpers.                                                |
| `src/v4/screen/`       | Screen implementations wired into routes and exported for reuse.                                             |
| `src/v4/stores/`       | Redux Toolkit store configuration, slices, and selectors.                                                    |
| `src/v4/types/`        | Shared TypeScript type definitions and interfaces.                                                           |
| `src/v4/utils/`        | Pure utility helpers (formatters, mappers, validators).                                                      |

## Entry Points & Integration Flow

1. **Provider setup:** Consumers wrap their app (or subtree) with `AmityUiKitProvider`, supplying API credentials, optional config overrides, and callbacks.
2. **Complete experience:** Render `<AmityUiKitSocial />` inside the provider to mount the full tabbed social experience.
3. **Standalone usage:** For targeted experiences (e.g., community profile, post detail), import the specific component from the package and wrap it with `<AmityPageRenderer>` to ensure navigation context and shared services are available.
4. **Config overrides:** Import `uikit.config.json` (or a custom variant) and pass as the `configs` prop on the provider to drive themes, typography, and feature flags.
5. **SDK integration:** Providers internally initialize `@amityco/ts-sdk-react-native`, so consumers only supply credentials and handle auth token rotation as needed.

## Dependencies Overview

### Runtime

Please refer to /package.json > dependencies & devDependencies

## Peer

The peer dependencies must be provided by host app and should be the versions compatible with React Native version in the host app.

Please refer to /package.json > peerDependencies

- Core React Native stack: `react`, `react-native`, navigation (`@react-navigation/native`, `.../stack`, `.../native-stack`), gestures (`react-native-gesture-handler`, `react-native-screens`, `react-native-safe-area-context`).
- Media & storage: `react-native-image-picker`, `react-native-video`, `react-native-video-controls`, `react-native-compressor`, `react-native-fs`, `react-native-vision-camera`, `react-native-svg`, `@react-native-community/datetimepicker`.
- Networking & utilities: `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`, `react-native-get-random-values`, `react-native-linear-gradient`.
- Amity platform: `@amityco/ts-sdk-react-native` plus optional Firebase messaging modules for push notifications.
- Tools: `@babel/plugin-transform-export-namespace-from`, `metro-react-native-babel-preset`

## Assets Handling

- Static assets reside in `v4/assets/icons`, and `v4/assets/images`.

**NOTE: icons are treated as javascript function to return svg string and rendered using `react-native-svg` library to customize colors and sizes**
