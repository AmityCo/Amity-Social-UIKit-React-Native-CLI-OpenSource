# Shareable Links Feature Plan

Branch: `feat/SP-30873-shareable-links`

- **Phase 1** — Community Profile ✅
- **Phase 2** — User Profile ✅
- **Phase 3** — Livestream ✅
- **Phase 4** — Posts ✅

---

## Key Architecture

- **Bottom sheet**: Redux slice at `src/core/stores/slices/bottomSheetSlice.ts` — supports `dark` prop for `#191919` background
- **Share link**: `useShareableLink` hook at `src/core/hooks/useShareableLink.ts` — calls `client.getShareableLinkConfiguration()`
- **`ShareableLinkModel`** enum: `posts | communities | users | livestreams`
- **`bottomSheetHeight`**: `{1:150, 2:180, 3:220, 4:270, 5:300}`
- **Actions array pattern**: `[{ show: boolean, action: ReactNode }].filter(({ show }) => show)`

---

## Reusable Share Elements

| Element             | Path                                      | Props                        |
| ------------------- | ----------------------------------------- | ---------------------------- |
| `CopyLinkAction`    | `src/social/elements/CopyLinkAction/`     | `link`, `pageId`, `dark?`    |
| `ShareAction`       | `src/social/elements/ShareAction/`        | `link`, `pageId`, `dark?`    |
| `MenuAction`        | `src/social/elements/MenuAction/`         | `dark?` → white icon + label |
| `verticalMenu` icon | `src/core/assets/icons/vertical-menu.tsx` | —                            |

Dark bottom sheet: pass `dark: true` to `openBottomSheet()`.

---

## Phase 1 — Community Profile ✅

**Permission table:**

| Community type                   | Who sees menu       | Bottom sheet content                         |
| -------------------------------- | ------------------- | -------------------------------------------- |
| Public/discoverable + Moderator  | Always              | Community settings + Copy link + Share to    |
| Public/discoverable + Member     | Always              | Community information + Copy link + Share to |
| Public/discoverable + Non-member | If `canShare`       | Copy link + Share to only                    |
| Private hidden + Moderator       | Always              | Community settings + Copy link + Share to    |
| Private hidden + Member          | Always (`isJoined`) | Community information only                   |
| Private hidden + Non-member      | Never               | —                                            |

Menu button visibility: `community?.isJoined || canShare`

**Key files:**

- `src/social/screens/CommunityProfile/components/Header/Header.tsx`
- `src/social/screens/CommunityProfile/index.tsx`

**uikit.config.json entries:**

```json
"community_profile_page/*/share_link": { "image": "icon", "text": "Share to" },
"community_profile_page/*/copy_link": { "image": "icon", "text": "Copy profile link" }
```

---

## Phase 2 — User Profile ✅

No restrictions — all users can share any profile (public or private).

**Key files:**

- `src/social/features/user/Profile/components/TopBar/hooks/useTopBar.ts` — `shareLink = userId ? getShareLink(ShareableLinkModel.users, userId) : null`
- `src/social/features/user/Profile/components/TopBar/TopBar.tsx` — `menuActions` array

**uikit.config.json entries:**

```json
"user_profile_page/*/share_link": { "image": "icon", "text": "Share to" },
"user_profile_page/*/copy_link": { "image": "icon", "text": "Copy profile link" }
```

---

## Phase 3 — Livestream ✅

**Permission table:**

| targetType    | isPublic | Share visible?         |
| ------------- | -------- | ---------------------- |
| `'user'`      | —        | Yes                    |
| `'community'` | `true`   | Yes                    |
| `'community'` | `false`  | No — hide `⋮` entirely |

**Design:** Vertical 3-dot `MenuButton variant="vertical"` in a flex row beside LIVE badge (Player) / LiveTimerStatus (Create). Bottom sheet is dark themed (`#191919` bg, white text/icons).

**Layout:** Single `liveRow` container (`position: absolute, right: 16, flexDirection: row, gap: 8`) replaces the old separate `indicator`/`timer` (right:48) + `menu` (right:16) elements. When no menu button, badge/timer sits flush right naturally.

**Privacy check:**

- **Player** — `post.targetCommunity?.isPublic` (available via SDK `PostLinkObject`, no extra fetch)
- **Create** — `useCommunity(targetId)` when `targetType === 'community'`

**Key files:**

- `src/social/elements/MenuButton/MenuButton.tsx` — `variant='vertical'`
- `src/social/features/livestream/Player/Player.tsx` — `canShare` gate, `liveRow` JSX, `openBottomSheet({ dark: true, ... })`
- `src/social/features/livestream/Player/styles.ts` — `liveRow` style
- `src/social/features/livestream/Create/Create.tsx` — `useCommunity`, `canShare` gate, `liveRow` JSX
- `src/social/features/livestream/Create/styles.ts` — `liveRow` style

**uikit.config.json entries:**

```json
"livestream_player_page/*/share_link": { "image": "icon", "text": "Share to" },
"livestream_player_page/*/copy_link": { "image": "icon", "text": "Copy live stream link" },
"create_livestream_page/*/share_link": { "image": "icon", "text": "Share to" },
"create_livestream_page/*/copy_link": { "image": "icon", "text": "Copy live stream link" }
```

---

## Phase 4 — Posts ✅

**Permission (community posts):** `isPublic === true` only (via `post.targetCommunity?.isPublic`).

**Permission (user timeline posts):**

| Viewer                                        | Public network | Private network |
| --------------------------------------------- | -------------- | --------------- |
| Post owner (`creator.userId === myId`)        | ✅ Always      | ✅ Always       |
| Follower (`followInfo.status === 'accepted'`) | ✅ Yes         | ✅ Yes          |
| Non-follower                                  | ✅ Yes         | ❌ No           |
| Blocked (`followInfo.status === 'blocked'`)   | ❌ No          | ❌ No           |

**Two entry points:**

1. **Engagement bar** (`FeedStyle` + `DetailStyle`) — `<ShareButton>` icon beside Like/Comment. `handleSharePress` triggers `impactHeavy` haptic then opens bottom sheet with `CopyLinkAction` + `ShareAction`.
2. **PostMenu (3-dot)** — `CopyLinkAction` + `ShareAction` in menu with `onPress={closeBottomSheet}`.

**Shared hook:** `usePostShareAction({ postId, postData, pageId? })` → `{ shareLink, handleSharePress }` — encapsulates permission logic, haptic, and bottom sheet opening. All three files use this hook.

**New element:** `ShareButton` (`src/social/elements/ShareButton/`) — `TouchableOpacity` + `SvgXml share()` icon, uses `useAmityElement(ElementID.share_button)` for exclude check and `themeStyles.colors.baseShade2` color. Props: `pageId`, `componentId?`, `onPress`, `style?`.

**Haptic:** `react-native-haptic-feedback` — peerDependency, consumers must install.

**Key files:**

- `src/social/features/post/components/EngagementActions/Components/usePostShareAction.tsx`
- `src/social/features/post/components/EngagementActions/Components/FeedStyle.tsx`
- `src/social/features/post/components/EngagementActions/Components/DetailStyle.tsx`
- `src/social/components/PostMenu/index.tsx`
- `src/social/elements/ShareButton/`

**uikit.config.json entries:**

```json
"*/post_content/share_link": { "image": "icon", "text": "Share to" },
"*/post_content/copy_link": { "image": "icon", "text": "Copy post link" }
```
