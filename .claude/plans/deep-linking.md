# Deep Link Navigation — Detailed Flow Diagrams

---

## System Design

```
┌─────────────────────────────────────────────────────┐
│                  Example App (App.tsx)               │
│  - Root React Native component                       │
│  - Handles FCM token + permissions                   │
│  - Calls navigate() on notification tap              │
│  - Renders AmityUiKitProvider + AmityUiKitSocial     │
└────────────────┬────────────────────────────────────┘
                 │ navigate() → immediate or queue
                 ▼
┌─────────────────────────────────────────────────────┐
│               UIKit (src/)                           │
│  - AmityUiKitSocial                                  │
│  - AmityUIKitNavigator (NavigationContainer + ref)   │
│  - onReady → onNavigationReady                       │
│  - onSdkReady → flushes pending notification         │
└─────────────────────────────────────────────────────┘
```

**Gate conditions** — `navigate()` executes immediately only when **both** are true:

- `navigationRef.isReady()` — `NavigationContainer` has mounted
- `isSdkReady` — Amity SDK client has initialised

---

## Notification Routing Logic

`handleNotificationNavigation(remoteMessage)` routes by `data.eventName`. Returns early if no `data`.

| `eventName`                                                                                                                                                                                                       | Screen                 | Params                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------- |
| `post.created`, `post.approved`, `post.need-reviewing`                                                                                                                                                            | `CommunityProfilePage` | `{ communityId: data.communityId }` |
| `post.reacted`, `comment.created`, `comment.replied`, `comment.reacted`, `text-mention-post.created`, `text-mention-user-feed-post.created`, `text-mention-comment.created`, `text-mention-comment.replied`, etc. | `PostDetail`           | `{ postId: data.postId }`           |
| `follow.created`, `follow.accepted`, `follow.requested`                                                                                                                                                           | `UserProfile`          | `{ userId: data.publicId }`         |

---

## Flow 1 — Background, App Already Running (Happy Path)

> User was using the app, backgrounded it, taps a notification

```
[push arrives, user taps notification]
        ↓
OS brings Example App to foreground
        ↓
App.tsx
  onNotificationOpenedApp fires
  handleNotificationNavigation(remoteMessage)
        ↓
  data.eventName = "comment.created"
  → navigate('PostDetail', { postId: data.postId })
        ↓
  navigationRef.isReady() = true   ← NavigationContainer already mounted
  isSdkReady = true                ← SDK already initialised
  → navigationRef.navigate('PostDetail', { postId }) immediately
        ↓
UIKit navigates to PostDetail ✅
```

---

## Flow 2 — Cold Start, App Was Killed

> User taps notification, app launches from scratch

```
[user taps notification, app cold starts]
        ↓
React Native bootstraps, App.tsx mounts
        ↓
App.tsx
  permission check runs
  fcmToken not yet set → renders null (AmityUiKitSocial not mounted)

  getInitialNotification() resolves
  handleNotificationNavigation(remoteMessage)
        ↓
  data.eventName = "follow.created"
  → navigate('UserProfile', { userId: data.publicId })
        ↓
  navigationRef.isReady() = false  ← NavigationContainer not yet mounted
  (or isSdkReady = false)
  → notification queued as pending
        ↓
fcmToken set → AmityUiKitProvider + AmityUiKitSocial mount
        ↓
UIKit
  SDK client initialises → onSdkReady()
  NavigationContainer mounts → onNavigationReady()

  Both gates pass → navigationRef.navigate('UserProfile', { userId })
  notification = null
        ↓
UIKit navigates to UserProfile ✅
```

---

## Flow 3 — Foreground, User Receives Notification (No Auto-Navigate)

> User is actively using the app — no auto-navigation to avoid disrupting UX

```
App.tsx
  onMessage fires (foreground notification)
        ↓
  console.log only — no navigation called
  (optionally: show in-app banner, user taps → call navigate())
        ↓
UIKit stays on current screen ✅
```

---

## Pending Notification Queue — How It Works

```
navigate(name, params)
        │
        ├─ isReady() && isSdkReady ──▶  navigationRef.navigate() immediately
        │
        └─ either gate false ────────▶  notification = { name, params }
                                               │
                              ┌────────────────┴────────────────┐
                              │                                 │
                    NavigationContainer                    SDK client
                      onReady fires                       initialises
                    onNavigationReady()                   onSdkReady()
                              │                                 │
                              └────────────┬────────────────────┘
                                           │
                                  both gates pass?
                                           │
                              YES ──▶  navigationRef.navigate()
                                       notification = null
```

---

## What Was Built

### 1. `src/core/routes/navigation.ts`

- `navigationRef` — attached to `NavigationContainer`, not exported publicly
- `navigate<T>(name, params)` — public API; fires immediately when both gates pass, otherwise queues
- `onNavigationReady()` — called by `NavigationContainer.onReady`; flushes pending notification if SDK is also ready
- `onSdkReady()` — called after Amity SDK initialises; flushes pending notification if nav is also ready
- `isSdkReady` — internal flag; ensures navigation doesn't fire before SDK client is ready
- `PendingRoute` (`Notification`) — discriminated union keeping `name`/`params` correlated

### 2. `src/core/routes/AmityUIKitNavigator.tsx`

- Imports `navigationRef` + `onNavigationReady` from `./navigation`
- `<NavigationContainer ref={navigationRef} onReady={onNavigationReady}>`

### 3. `src/core/index.tsx` + `src/index.tsx`

- Exports `navigate` + `onSdkReady` publicly
- `onNavigationReady` and `navigationRef` are internal only

### 4. `example/src/App.tsx`

- Imports `navigate` from the UIKit package
- `handleNotificationNavigation(remoteMessage)` — returns early if no `data`
- Routes entirely by `data.eventName`
- `onNotificationOpenedApp` + `getInitialNotification` both call `handleNotificationNavigation`
- `onMessage` present but only logs — no navigation (foreground UX intentionally unchanged)
- Renders `null` until `fcmToken` is available, then mounts `AmityUiKitProvider` + `AmityUiKitSocial`

---

## Edge Cases

| Scenario                                     | Behavior                                                              |
| -------------------------------------------- | --------------------------------------------------------------------- |
| Multiple notifications tapped quickly        | Last one wins — `notification` is overwritten                         |
| UIKit unmounts and remounts                  | `onReady` fires again; `notification = null` → no-op                  |
| `navigate` called, UIKit never mounts        | `notification` sits in memory, never fires                            |
| UIKit already on target screen               | React Navigation deduplicates the same route                          |
| fcmToken not yet available                   | App renders `null`; handlers run, notification queued until SDK ready |
| SDK initialises before `NavigationContainer` | `onSdkReady` sets flag; `onNavigationReady` flushes when nav mounts   |
| `NavigationContainer` mounts before SDK      | `onNavigationReady` no-ops; `onSdkReady` flushes when SDK is ready    |
