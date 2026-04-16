# Amity React Native Social UIKit — Engineering Guide

This guide helps client-side engineers understand how the UIKit is structured, where to extend it, and how it integrates with native layers. Pair it with the public README for installation steps.

---

## Architecture

- **Library target:** The entire repo (`@amityco/react-native-social-uikit`) is a React Native CLI project that exports a prebuilt UIKit library with social features. The compiled output is in `/lib`.
- **Sample app:** The `/example` folder is a runnable sample app demonstrating integration, Firebase push notifications, and UIKit configuration overrides.
- **Two-module split:** Source code is divided into two top-level modules — `src/core` (infrastructure) and `src/social` (feature implementation). They are re-exported together via `src/index.tsx`.
- **State & data:** Combines `Redux Toolkit` (isolated to a custom context in `src/core/stores`) with `@tanstack/react-query` for server-side caching and the Amity TS SDK for network operations.

---

## Top-Level Directory Structure

```text
/
├── android/              # Android native bridge modules
├── assets/               # Root-level static assets
├── example/              # Runnable sample / integration app
├── ios/                  # iOS native bridge modules
├── lib/                  # Compiled output (commonjs, esm, typescript declarations)
├── scripts/              # Build and release utility scripts
├── src/                  # All TypeScript source code
│   ├── core/             # Infrastructure: providers, routes, stores, hooks, utils
│   ├── social/           # Feature implementation: screens, features, components, elements
│   └── index.tsx         # Single public entry point — re-exports everything
├── uikit.config.json     # Default theme, colors, and per-component customization
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## Source Code Layout (`src/`)

### `src/index.tsx` — Public Entry Point

The single surface exposed to consumers. It:

1. Imports everything from `./core` and `./social`.
2. Applies a `BackHandler.removeEventListener` polyfill for React Native 0.65+ compatibility.
3. Re-exports every public API (providers, pages, components, enums, types).

> **Rule:** Never import from `src/core` or `src/social` directly in consumer code. Always go through the package root.

---

### `src/core/` — Infrastructure Module

Owns the foundational pieces that every feature depends on. It has no knowledge of specific feature domains.

| Path                   | Purpose                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/core/index.tsx`   | Exports `AmityUiKitProvider`, `AmityUiKitSocial`, `AmityPageRenderer`, `ErrorBoundary`                                       |
| `src/core/assets/`     | Shared icons (60+ SVG components), images (36 groups), and config asset maps (32 files)                                      |
| `src/core/components/` | Foundational UI primitives: `Tabs`, `Radio`, `CheckBox`, `ErrorBoundary`                                                     |
| `src/core/enums/`      | Enum definitions used across both modules                                                                                    |
| `src/core/engines/`    | `AdEngine`, `AdSupplier`, `AdAssetCache`, `AssetDownloader`, `TimeWindowTracker`                                             |
| `src/core/hooks/`      | 10 cross-feature hooks: auth, config, file, gallery, image picker, reaction, search, social settings, story, time difference |
| `src/core/legacy/`     | Backward-compatible shims: `user`, `community`, `feed`, `file`, `comment`                                                    |
| `src/core/providers/`  | `AmityUIKitProvider` (root), `AuthProvider`, `ConfigProvider`                                                                |
| `src/core/routes/`     | `AmityUIKitNavigator` (full nav stack), `AmityPageRenderer`, `RouteParamList` (all route types)                              |
| `src/core/stores/`     | Redux store configuration and all slice definitions                                                                          |
| `src/core/types/`      | Shared TS interfaces: `config`, `user`, `auth`, `behaviour`, `mention`                                                       |
| `src/core/utils/`      | Pure helpers: `api`, `color`, `enumUIKitID`, `number`, `permission`, `post`, `postType`, `role`, `time`, `url`               |

#### Providers (`src/core/providers/`)

| File                     | Responsibility                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AmityUIKitProvider.tsx` | Root provider. Initializes auth via `@amityco/ts-sdk-react-native`, applies theme (light/dark), merges `uikit.config.json` overrides, wraps the Redux store, and sets up React Query. |
| `AuthProvider.tsx`       | Manages auth state and token refresh callbacks.                                                                                                                                       |
| `ConfigProvider.tsx`     | Distributes parsed config down the tree.                                                                                                                                              |

#### Redux Store (`src/core/stores/`)

The store uses a **custom React context** (`AmityUIKitReduxContext`) to avoid collisions with host app Redux stores.

```text
src/core/stores/
├── store/
│   └── index.ts           # configureStore, AmityUIKitReduxContext, useUIKitStore/Dispatch/Selector hooks
└── slices/
    ├── globalfeedSlice.ts
    ├── feedSlice.ts
    ├── postDetailSlice.ts
    ├── uiSlice.ts
    ├── bottomSheetSlice.ts
    └── toastSlice.ts
```

> **Important:** Always use `useUIKitStore`, `useUIKitDispatch`, and `useUIKitSelector` (exported from `src/core/stores/store`) instead of the standard `react-redux` hooks. This ensures isolation from the host app's store.

#### Navigation (`src/core/routes/`)

| File                      | Purpose                                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AmityUIKitNavigator.tsx` | Native stack navigator mounting all 38+ screens. Used internally by `AmityUiKitSocial`.                                                                     |
| `AmityPageRenderer.tsx`   | Wraps a standalone page/component with the necessary navigation context. Required when embedding a single page outside of the full `AmityUiKitSocial` flow. |
| `RouteParamList.tsx`      | `RootStackParamList` — TypeScript type map of every route name to its params. Extend this when adding a new screen.                                         |

---

### `src/social/` — Feature Implementation Module

Owns everything related to social feature UX. Organized in four tiers from the most atomic to the most composite.

```text
src/social/
├── index.tsx         # All public feature exports
├── elements/         # Tier 1 — atomic UI building blocks (68 directories)
├── components/       # Tier 2 — reusable cross-feature components (53 directories)
├── features/         # Tier 3 — domain-scoped feature modules (12 domains)
├── screens/          # Tier 4 — full-page screens wired into navigation (38 screens)
├── hooks/            # Social-specific custom hooks (48+ hooks)
├── enums/            # Feature-level enumerations
├── providers/        # Feature-level context providers
├── types/            # Feature-specific TS types
└── utils/            # Feature-specific pure utilities
```

#### Tier 1 — Elements (`src/social/elements/`)

Fine-grained, single-purpose UI atoms. These should have no business logic.

Examples: `ActionButton`, `BackButton`, `CameraButton`, `CommunityOfficialBadge`, `CommunityPrivateBadge`, `CommunityVerifyBadge`, `LikeButtonIconElement`, `ModeratorBadge`, `PinBadge`, `ShareButtonIconElement`, `TimestampElement`, `TitleElement`, `ImageGallery`, `VideoGallery`, `ImageViewer`, `VideoViewer`

#### Tier 2 — Components (`src/social/components/`)

Medium-level, reusable components that compose elements and may contain minor local state. They are usable across multiple feature domains.

Examples: `Avatar`, `Button`, `Gallery`, `PopupMenu`, `PostContent`, `Toast`, `Typography`, `SearchInput`, `EmptyList`, `CircularProgressIndicator`, `PostFeedSkeleton`, `PollContent`, `LivestreamContent`

> Legacy components live in `src/social/components/legacy/` (26 sub-directories) for backward compatibility. Prefer the non-legacy equivalents for new work.

#### Tier 3 — Features (`src/social/features/`)

Domain-scoped modules. Each feature folder owns its own sub-components, types, and hooks relevant only to that domain.

| Feature       | Key Contents                                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `comment/`    | `components/PostComment`                                                                                                                        |
| `community/`  | `AddCategory`, `AddMember`, `PendingRequest`, `Membership`, `PostPermission`, `StorySetting`, `Setup`, `Setting`, `NotificationSetting`         |
| `feed/`       | `TopNavigation`, `EmptyNewsFeed`, `GlobalFeed`, `MyCommunities`, `NewsFeed`, `CreatePostMenu`, `Explore`                                        |
| `livestream/` | `Create`, `Player`, `TargetSelection`, `Terminated`, `components/ThumbnailAction`                                                               |
| `poll/`       | `Composer`, `TargetSelection`                                                                                                                   |
| `post/`       | `Composer`, `Detail`, `TargetSelection`, `components/{Content, EngagementActions, EngagementContent, MediaAttachment, DetailedMediaAttachment}` |
| `reaction/`   | `components/List`                                                                                                                               |
| `room/`       | Chat room support                                                                                                                               |
| `search/`     | `CommunitySearchResult`, `UserSearchResult`, `TopSearchBar`                                                                                     |
| `story/`      | `Create`, `Draft`, `View`, `TargetSelection`, `components/Tab`                                                                                  |
| `user/`       | `Profile`                                                                                                                                       |

#### Tier 4 — Screens (`src/social/screens/`)

Full-page views wired directly into `RootStackParamList`. Each screen is responsible for layout and integrating one or more feature-tier components.

Key screens: `SocialHomePage`, `CommunityProfile`, `PostDetail`, `UserProfile`, `CreatePost`, `EditPost`, `CreateStory`, `SocialGlobalSearch`, `MyCommunitiesSearch`, `AllCategories`, `CommunitiesByCategory`, `CreateLivestream`, `LivestreamPlayer`, `PollPostComposer`, `EditCommunity`, `CreateCommunity`, `GlobalFeed`, `Feed`, `GlobalBan`, `FollowerList`, `EditProfile`

> `CommunityProfile` has its own `components/` sub-folder (`Feed`, `Header`, `ImageFeed`, `VideoFeed`, `PinnedPost`, `PendingPostList`) because they are exclusive to that screen.

#### Hooks (`src/social/hooks/`)

```text
src/social/hooks/
├── collections/              # Paginated list hooks (8 hooks)
│   ├── useCategoryCollection.ts
│   ├── useCommunityMemberCollection.ts
│   ├── useLiveCollection.ts
│   ├── usePinnedPostCollection.ts
│   ├── usePostCollection.ts
│   ├── useSearchMemberByDisplayNameCollection.ts
│   ├── useSearchUserByDisplayNameCollection.ts
│   └── useUserCollection.ts
├── useMention/               # Mention input with display formatting
└── [40+ individual hooks]    # useCommunity, usePost, useStory, useUser, etc.
```

#### Feature Providers (`src/social/providers/`)

| File                    | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `AdEngineProvider.tsx`  | Serves and tracks ad impressions via the core `AdEngine`.                       |
| `BehaviourProvider.tsx` | Provides runtime behavior overrides (e.g., custom navigation on community tap). |
| `ExploreProvider.tsx`   | Manages explore tab state (trending, recommended communities).                  |

#### Enums (`src/social/enums/`)

| File                                           | Contents                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `enumUIKitID.ts`                               | IDs for every customizable UIKit component — used in `uikit.config.json` lookups |
| `enumTheme.ts`                                 | Theme variant identifiers                                                        |
| `enumTabName.ts`                               | Tab bar item names                                                               |
| `postTargetType.ts`                            | `PostTargetType` — community vs. user                                            |
| `AmityPostContentComponentStyle.ts`            | `AmityPostCategory` — general vs. announcement                                   |
| `storyType.ts`, `mediaAttachmentEnum.ts`, etc. | Other feature enums                                                              |

---

## Entry Points & Integration Flow

### 1. Full social experience

```tsx
import {
  AmityUiKitProvider,
  AmityUiKitSocial,
} from '@amityco/react-native-social-uikit';
import config from './uikit.config.json';

<AmityUiKitProvider
  apiKey="..."
  apiRegion="..."
  userId="..."
  displayName="..."
  configs={config} // optional — pass to override theme/features
>
  <AmityUiKitSocial />
</AmityUiKitProvider>;
```

### 2. Standalone page embedding

```tsx
import { AmityUiKitProvider, AmityPageRenderer, AmityCommunityProfilePage } from '@amityco/react-native-social-uikit';

<AmityUiKitProvider ...>
  <AmityPageRenderer>
    <AmityCommunityProfilePage communityId="..." />
  </AmityPageRenderer>
</AmityUiKitProvider>
```

`AmityPageRenderer` injects the navigation context required by all internal pages. It must wrap any standalone page used outside `AmityUiKitSocial`.

### 3. Config overrides

`uikit.config.json` at the project root is the canonical theme file. It controls:

- **Colors:** Primary, secondary, base palettes with four shade levels each; alert and live-action colors; light and dark variants.
- **Per-component overrides:** 100+ component paths, each accepting `icon`, `text`, `color`, `background`, `visibility`, and `expandable` keys.
- **Feature flags:** Toggle entire features (stories, polls, livestreams, ads) at the config level.

Pass a modified copy (or a fully custom object) as `configs` to `AmityUiKitProvider`.

## Adding New Screens

1. **Create the screen** in `src/social/screens/YourScreenName/index.tsx`.
2. **Register the route** — add an entry to `RootStackParamList` in `src/core/routes/RouteParamList.tsx`.
3. **Mount in the navigator** — add a `<Stack.Screen>` inside `AmityUIKitNavigator.tsx` (`src/core/routes/`).
4. **Export publicly** — add the export to `src/social/index.tsx` then re-export from `src/index.tsx` if it should be available to consumers.

---

## Assets Handling

- Icons and images live in `src/core/assets/icons/` and `src/core/assets/images/`.
- Config assets are deprecated

> **Icons are JavaScript functions** that return an SVG string and are rendered via `react-native-svg`. This allows runtime color and size customization without bundling raster images.

---
