---
name: features
description: Best Practices for Feature Development
---

# Feature Development Workflow

## Step 1 — Inspect the Figma Design

Copy the Figma URL from the file and use `mcp__figma-remote-mcp__get_design_context`.

Extract from the design:

- Layout structure (TopBar, Tabs, List, Empty state)
- Spacing, sizes, colors → map to theme tokens (`baseShade3`, `secondaryShade4`, etc.)
- Icon names (e.g. `list-radio` → `emptyList`)
- Typography variants (`TitleBold`, `BodyBold`, `Caption`, etc.)
- Component API: props the feature needs (`userId`, `selectedTab`, etc.)

---

## Step 2 — Define the Component API and Types

Define enums/types in `src/social/types/index.ts` (centralized social types file).

- Enum names: `PascalCase`, no `Amity` prefix (e.g. `UserRelationshipTab`)
- Enum values: `camelCase` (e.g. `following`, `follower`)

Reference: `src/social/types/index.ts`

---

## Step 3 — Register the Route and Export Publicly

1. Add route type to `src/core/routes/RouteParamList.tsx`
2. Register screen in `src/core/routes/AmityUIKitNavigator.tsx`
3. Create screen wrapper under `src/social/screens/${FeatureName}/`
4. Export from `src/social/screens/index.ts`
5. Export from `src/social/index.tsx` using the `Amity` prefix convention:
   ```ts
   // Pages
   export { MyFeatureScreen as AmityMyFeaturePage } from './screens';
   // Sub-components (Feed, ImageFeed, VideoFeed, Header, etc.)
   export { Feed as AmityUserFeedComponent } from './features/user/Profile/components/Feed';
   ```
6. Import and re-export from `src/index.tsx` (both in the import block and the export block):
   ```ts
   import { ..., AmityMyFeaturePage } from './social';
   export { ..., AmityMyFeaturePage };
   ```

Rules:

- Pages: `Amity${Feature}Page` naming
- Sub-components: `Amity${Feature}Component` naming (no `Page` suffix)
- Every publicly reusable component must be exported

Reference: `src/social/screens/UserRelationship/`
Reference (sub-components): `src/social/features/user/Profile/components/`

---

## Step 4 — Feature Folder Structure

All features live under `src/social/features/${domain}/${FeatureName}/`.

```
FeatureName/
  FeatureName.tsx       ← main component (props = RootStackParamList['RouteName'])
  styles.ts             ← useStyles hook
  index.ts              ← named export of main component
  hooks/
    useFeatureName.ts   ← slim: state + context data only
  components/
    index.ts            ← re-exports all sub-components
    TopBar/
    UserItem/           ← item + compound Skeleton in same file
    FollowingList/
    FollowerList/
```

Rules:

- Every component has its own folder with matching filename
- Each folder has `index.ts` re-exporting named exports
- Never use anything from `legacy/` folders

Reference: `src/social/features/user/Relationship/`

---

## Step 5 — Main Feature Component

- Props type = `RootStackParamList['RouteName']` (not a custom type)
- Wrap with `SafeAreaView` from `react-native-safe-area-context`, `edges={['top']}`
- All logic in the feature hook — component is purely presentational

Reference: `src/social/features/user/Relationship/Relationship.tsx`

---

## Step 6 — Feature Hook

Keep slim — only manages state, fetches context data (e.g. user displayName), returns styles.
Do NOT fetch list data here — delegate to each list component and its collection hook.
Navigation logic lives in the hook that owns the action, not in the component.

**Hook-first rule (applies to ALL components, not just the main feature):**
Every component — including sub-components like `Feed`, `ImageFeed`, `VideoFeed` — must move ALL logic into its own hook. The component file is render-only: it only unpacks values from the hook and renders JSX.

This includes:

- SDK collection calls (`useUserFeed`, `useLiveCollection`, etc.)
- `useNavigation`
- `useImperativeHandle` (can live inside the hook by accepting `React.ForwardedRef<T>`)
- Customization hooks (`useAmityPage`, `useAmityComponent`, `useAmityElement`)
- Any derived state

File structure for sub-components:

```
ComponentName/
  ComponentName.tsx   ← render-only, calls useComponentName({ ...props, ref })
  index.ts            ← export * from './ComponentName'
  hooks/
    useComponentName.ts  ← ALL logic here
```

Reference: `src/social/features/user/Relationship/hooks/useUserRelationship.ts`
Reference (navigation logic in hook): `src/social/features/user/Profile/components/Header/hooks/useHeader.ts`
Reference (hook-first sub-component): `src/social/features/user/Profile/components/Feed/hooks/useFeed.ts`

---

## Step 7 — Styles

Every component has its own `styles.ts` with a `useStyles` hook using `useTheme<MyMD3Theme>()` and `StyleSheet.create`.

Theme token reference (from Figma color variables):

- `theme.colors.background` — page background
- `theme.colors.base` — primary text / icon
- `theme.colors.baseShade3` — secondary text (#a5a9b5)
- `theme.colors.baseShade4` — dividers / placeholder (#ebecef)
- `theme.colors.secondaryShade4` — empty state icon color (#ebecef)
- `theme.colors.primary` — active/accent color

Reference: `src/social/features/user/Relationship/styles.ts`

---

## Step 8 — SDK Collection Hooks

Create per-entity hooks under `src/social/hooks/collections/${domain}/use${Entity}Collection.ts`.

Rules:

- Always use `useLiveCollection` (NOT `useReactQueryLiveCollection`)
- Derive params type from SDK: `Parameters<typeof SDK.method>[0]`
- Rename `items` to domain name (`followers`, `followings`, `posts`, etc.)
- Spread `...rest` to expose `loadMore`, `hasMore`, `isLoading`, `isLoadingFirstPage`
- Guard with `enabled: !!param`
- Export from `src/social/hooks/collections/index.ts`

Reference: `src/social/hooks/collections/user/useFollowerCollection.ts`

---

## Step 8b — SDK Mutation Hooks

Create per-action hooks under `src/social/hooks/queries/use${Action}.ts`.

Define top-level type aliases using `Awaited<ReturnType<...>>` and `Parameters<...>` — never hardcode types. Use these aliases as explicit generics in `useMutation`. Name types `${Action}Payload` and `${Action}Param`. `TError` is always `Error`.

Reference: `src/social/hooks/queries/useFollowUser.ts`

---

## Step 9 — TopBar Component

Always create a dedicated `TopBar` — never use navigation headers.
Navigation logic (pushing to another screen) belongs in the hook file, not the component.

Reference: `src/social/features/user/Relationship/components/TopBar/`

---

## Step 10 — Tabs Component

Use the core `Tabs` component from `src/core/components/Tabs`. Do NOT build custom tab UIs.

- Use `variant="underline"` for profile/relationship pages
- Pass a TypeScript generic for type-safe tab values
- Each tab content gets its own list component

Reference: `src/social/features/user/Relationship/Relationship.tsx`
Reference (another example): `src/social/features/community/Membership/`

---

## Step 11 — List Components with Skeleton and Empty State

- `ListEmptyComponent`: guard with `!isLoading && !isLoadingFirstPage`; use `<Empty>` component
- `ListFooterComponent`: show `3` `<Component.Skeleton />` items while loading
- `onEndReached`: only fire when `hasMore && !isLoading && !isLoadingFirstPage`

Reference: `src/social/features/user/Relationship/components/FollowingList/FollowingList.tsx`

---

## Step 12 — List Item Component with Compound Skeleton

Define the skeleton inside the same file as the item and attach as a compound component.
The skeleton reuses `useStyles` so dimensions always match the real item.

```ts
UserItem.Skeleton = UserItemSkeleton; // after both functions, at bottom of file
```

Usage: `<UserItem.Skeleton />` — only import `UserItem`, never import the skeleton separately.

Rules:

- Use `MenuButton` element (not raw `SvgXml`) for three-dot menu
- Use `Avatar.User` for user avatars
- Use `Typography.*` for all text, never raw `Text`
- Use `Skeleton.Circle`, `Skeleton.Line`, `Skeleton.Square` from `src/core/components/Skeleton`

Reference: `src/social/features/user/Relationship/components/UserItem/UserItem.tsx`

---

## Step 13 — Icon Usage

Icons live in `src/core/assets/icons/`. Each is a function returning an SVG string.
To render: `<SvgXml xml={iconFn()} width={X} height={X} color={theme.colors.XYZ} />`

Common Figma → codebase mapping:
| Figma name | File |
|----------------|---------------|
| `list-radio` | `emptyList` |
| `chevron-left` | `arrowLeft` |
| `ellipsis` | `menu` |

Use `MenuButton` element instead of raw `SvgXml` for the three-dot menu action.

---

## Step 14 — Naming Conventions

| Thing             | Convention                      | Example                    |
| ----------------- | ------------------------------- | -------------------------- |
| Feature folder    | `PascalCase`                    | `Relationship/`            |
| Component file    | `PascalCase` matching folder    | `Relationship.tsx`         |
| Hook file         | `camelCase` prefixed `use`      | `useUserRelationship.ts`   |
| Collection hook   | `use${Entity}Collection.ts`     | `useFollowerCollection.ts` |
| Enum name         | `PascalCase`, no `Amity` prefix | `UserRelationshipTab`      |
| Enum values       | `camelCase`                     | `following`, `follower`    |
| Screen wrapper    | `${Feature}Screen`              | `UserRelationshipScreen`   |
| Route name        | `PascalCase`                    | `UserRelationship`         |
| Styles hook       | always `useStyles`              | `useStyles`                |
| Skeleton compound | `Component.Skeleton`            | `UserItem.Skeleton`        |

---

## Step 15 — Toast and Alert Messages

Extract all user-facing strings (toast messages and alert dialogs) to `src/core/constants/index.ts`.

Use a nested structure: `CONSTANT_NAME.FEATURE.ACTION.STATE`

```ts
export const TOAST_MESSAGE = {
  USER: {
    BLOCK: {
      SUCCESS: 'User blocked.',
      FAILED: 'Failed to block user. Please try again.',
    },
  },
};

export const ALERT_MESSAGE = {
  USER: {
    BLOCK: {
      TITLE: 'Block user?',
      MESSAGE: (displayName: string) => `${displayName} won't be able to...`,
    },
  },
};
```

Rules:

- Keys are `UPPER_SNAKE_CASE`
- Dynamic messages are functions receiving the required parameter (e.g. `displayName`)
- Toast state keys: `SUCCESS` and `FAILED`
- Import from `src/core/constants` in the consuming file

Reference: `src/core/constants/index.ts` (`TOAST_MESSAGE`, `ALERT_MESSAGE`)

---

## Step 16 — Accessibility

Apply these accessibility rules to all interactive components:

**Touchable rows (lists, cards)**

```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`View ${user.displayName}'s profile`}
  ...
>
```

**Context-specific buttons**
Pass a descriptive label that includes the subject — not just the action:

```tsx
// ✗ Generic
<Button accessibilityLabel="Unblock">Unblock</Button>

// ✓ Specific
<Button accessibilityLabel={`Unblock ${user.displayName}`}>Unblock</Button>
```

**Three-dot menu buttons (MenuButton)**

```tsx
<MenuButton accessibilityLabel={`More options for ${user.displayName}`} />
```

**SVG icon components (BrandBadge, SvgXml)**
SVGs are invisible to screen readers by default — always provide:

```tsx
<BrandBadge
  accessible
  accessibilityLabel="Brand verified"
  width={16}
  height={16}
/>
```

**`aria-label` is a web prop — use `accessibilityLabel` in React Native**

```tsx
// ✗ Wrong
<MenuButton aria-label="Menu" />

// ✓ Correct
<MenuButton accessibilityLabel="Menu" />
```

Reference: `src/social/features/user/Relationship/components/UserItem/UserItem.tsx`

---

## Step 17 — Behavior Provider

Navigation overrides are defined as classes (`AmityXxxBehavior`) and wired through the behavior system so host apps can override navigation.

### 1. Define the type in `src/core/types/behaviour.ts`

Add to the `IBehaviour` interface. Use `RootStackParamList['RouteName']` for context types. For routes with `undefined` params, use `() => void` (no context arg).

```ts
AmityUserRelationshipPageBehavior?: {
  goToUserProfilePage?: (context: RootStackParamList['UserProfile']) => void;
};
AmityUserProfilePageBehavior?: {
  goToEditUserPage?: (context: RootStackParamList['EditUser']) => void;
  goToBlockedUsersPage?: () => void;
};
```

### 2. Register default in `src/social/providers/BehaviourProvider.tsx`

Add an empty object to `defaultBehaviour`:

```ts
AmityUserRelationshipPageBehavior: {},
AmityUserProfilePageBehavior: {},
```

### 3. Wire up in the consuming hook/component

Use `useBehaviour()` and apply the fallback pattern — check behavior first, then fall back to `navigation`:

```ts
const { AmityUserRelationshipPageBehavior } = useBehaviour();

const goToUserProfile = () => {
  if (AmityUserRelationshipPageBehavior?.goToUserProfilePage) {
    AmityUserRelationshipPageBehavior.goToUserProfilePage({ userId });
  } else {
    navigation.push('UserProfile', { userId });
  }
};
```

Rules:

- Navigation logic always lives in the hook, never inline in the component
- Always follow the pattern: check behavior → fallback to `navigation`
- Method names match the class definition exactly (e.g. `goToEditUserPage`, `goToBlockedUsersPage`)
- Use `navigation.push` for pages that may be in the same stack; use `navigation.navigate` for root-level pages

Reference: `src/core/types/behaviour.ts`, `src/social/providers/BehaviourProvider.tsx`
Reference (hook): `src/social/features/user/Relationship/components/UserItem/hooks/useUserItem.ts`
Reference (component): `src/social/features/user/Profile/components/TopBar/TopBar.tsx`

---

## Step 18 — Customizability (UIKit Config)

Every page supports text and image customization through `uikit.config.json` using the `pageId/componentId/elementId` key pattern.

### 1. Register IDs in `src/social/enums/enumUIKitID.ts`

Add entries to all three enums as needed:

```ts
// PageID — one per page
user_relationship_page = 'user_relationship_page',

// ComponentID — one per reusable component (Feed, ImageFeed, VideoFeed, etc.)
user_feed = 'user_feed',

// ElementID — one per customizable text/icon within a component
empty_user_feed = 'empty_user_feed',
unblock_user_button = 'unblock_user_button',
```

Existing IDs like `back_button`, `title` can be reused across pages.

### 2. Add config entries to both config files

Always append new page configs at the end of the `customizations` object in **both** files:

- `uikit.config.json` (root level)
- `example/uikit.config.json` (example app level)

Use actual display text in `text` fields; use `"value"` placeholder for `image` fields:

```json
"blocked_users_page/*/*": {},
"blocked_users_page/*/back_button": { "image": "value" },
"blocked_users_page/*/title": { "text": "Manage blocked users" },
"blocked_users_page/*/unblock_user_button": { "text": "Unblock" },

"user_profile_page/user_feed/*": {},
"user_profile_page/user_feed/empty_user_feed": { "text": "No posts yet" }
```

Config keys: `text` for labels, `image` for icon overrides (use `"value"` placeholder).

### 3. Wire `useAmityPage` into every page root

Every page calls `useAmityPage` in its hook and sets `accessibilityId` as `testID` on the root view:

```ts
// In the page hook:
const { accessibilityId } = useAmityPage({ pageId: PageID.user_profile_page });
return { accessibilityId, ... };

// In the page component:
<SafeAreaView testID={accessibilityId} ...>
```

### 4. Wire `useAmityComponent` into feed/list sub-components

Components that represent a logical section (Feed, ImageFeed, VideoFeed) call `useAmityComponent` in their hook:

```ts
// In the component hook (e.g. useFeed.ts):
const pageId = PageID.user_profile_page;
const componentId = ComponentID.user_feed;
const { accessibilityId: feedId } = useAmityComponent({ pageId, componentId });
```

Pass `feedId` back and use it as `testID` on the root view.

### 5. Wire `useAmityElement` for config-driven text

Inside the same hook, call `useAmityElement` for every customizable label:

```ts
const { config: emptyConfig } = useAmityElement({
  pageId,
  componentId,
  elementId: ElementID.empty_user_feed,
});
```

Pass `config` from the hook and use `config?.text as string` in the render component — no hardcoded fallback text needed once config JSON is populated.

### 6. Use existing config-aware elements for standard UI

Shared elements (`Title`, `BackButton`) already read from config — pass `pageId` and `elementId`:

```tsx
<BackButton pageId={PageID.blocked_users_page} onPress={navigation.goBack} />
<Title pageId={PageID.blocked_users_page} elementId={ElementID.title} />
```

### 7. Create a feature-level element for every new customizable UI piece

As there will be more customizable elements, each gets its own file in the feature's `elements/` folder. Never create inline customization logic in components.

```
features/user/Blocked/
  elements/
    UnblockUserButton/
      UnblockUserButton.tsx   ← named export, uses useAmityElement + ButtonProps
      index.ts                ← export * from './UnblockUserButton'
    index.ts                  ← re-exports all elements in this folder
```

The element uses `useAmityElement` to read config and falls back to a hardcoded default:

```tsx
export function UnblockUserButton({
  pageId = PageID.blocked_users_page,
  ...props
}: UnblockUserButtonProps) {
  const { config, isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  if (isExcluded) return null;
  return (
    <Button
      type="secondary"
      size={BUTTON_SIZE.SMALL}
      testID={accessibilityId}
      {...props}
    >
      {(config?.text as string) ?? 'Unblock'}
    </Button>
  );
}
```

Rules:

- Always update **both** `uikit.config.json` and `example/uikit.config.json`
- New config entries always go at the **end** of the `customizations` object
- Use actual display text for `text` fields; `"value"` placeholder for `image` fields
- `useAmityPage` → every page root; `useAmityComponent` → every feed/list sub-component; `useAmityElement` → every customizable label
- All `useAmity*` calls must live in the hook, never inline in the component
- Feature-level elements always use `ButtonProps` (or the relevant base props type) extended with `pageId/componentId/elementId`
- Always create `elements/index.ts` at the feature root to re-export all elements

Reference: `src/social/features/user/Blocked/elements/`
Reference: `src/social/enums/enumUIKitID.ts`, `uikit.config.json`, `example/uikit.config.json`
Reference (useAmityComponent + useAmityElement in hook): `src/social/features/user/Profile/components/Feed/hooks/useFeed.ts`

---

## Step 19 — Checklist Before Done

- [ ] Figma design inspected via MCP — layout, colors, icons confirmed
- [ ] Enum/types added to `src/social/types/index.ts`
- [ ] Route registered in `RouteParamList.tsx` and `AmityUIKitNavigator.tsx`
- [ ] Screen wrapper created and exported from `src/social/screens/index.ts`
- [ ] Screen exported from `src/social/index.tsx` as `Amity${Feature}Page`
- [ ] Screen imported and re-exported from `src/index.tsx`
- [ ] Feature folder: main file + `hooks/` + `components/` + `styles.ts` + `index.ts`
- [ ] Main feature hook is slim (state + context data only)
- [ ] Collection hooks use `useLiveCollection`, live under `hooks/collections/${domain}/`
- [ ] `TopBar` component created (no navigation headers)
- [ ] Navigation logic in hook files, not components
- [ ] Core `Tabs` component used with `variant="underline"` and TypeScript generic
- [ ] Each tab has its own list component
- [ ] `ListEmptyComponent` guarded by `!isLoading && !isLoadingFirstPage`
- [ ] `ListFooterComponent` shows 3 skeletons while loading
- [ ] Skeleton defined in same file as component, attached as `Component.Skeleton`
- [ ] `MenuButton` used for three-dot actions, `Avatar.User` for avatars, `Typography.*` for text
- [ ] All folders have `index.ts` with named re-exports
- [ ] Toast and alert messages extracted to `TOAST_MESSAGE` / `ALERT_MESSAGE` in `src/core/constants/index.ts`
- [ ] Touchable rows have `accessibilityRole="button"` and descriptive `accessibilityLabel`
- [ ] Buttons have subject-specific `accessibilityLabel` (e.g. `Unblock ${name}`, not just `Unblock`)
- [ ] SVG icons have `accessible` + `accessibilityLabel` (e.g. BrandBadge)
- [ ] No `aria-label` used — React Native uses `accessibilityLabel`
- [ ] Behavior class methods typed in `IBehaviour` using `RootStackParamList['RouteName']`
- [ ] Empty object registered in `BehaviourProvider.tsx` `defaultBehaviour`
- [ ] Navigation uses behavior fallback pattern: check behavior → fallback to `navigation`
- [ ] `PageID`, `ComponentID`, and `ElementID` entries added to `src/social/enums/enumUIKitID.ts`
- [ ] Config entries added at the end of both `uikit.config.json` and `example/uikit.config.json` with actual text values
- [ ] `useAmityPage` called in every page hook; `accessibilityId` set as `testID` on root view
- [ ] `useAmityComponent` called in every feed/list sub-component hook; `accessibilityId` used as `testID`
- [ ] `useAmityElement` called per customizable label; `config?.text as string` passed to render component
- [ ] All `useAmity*` calls live in the hook, not inline in the component
- [ ] Sub-components exported from `src/social/index.tsx` as `Amity${Feature}Component`
- [ ] New customizable UI has its own element file in `features/${domain}/${Feature}/elements/`
- [ ] Feature `elements/index.ts` exports all elements in the folder
