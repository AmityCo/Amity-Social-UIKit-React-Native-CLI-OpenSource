# Deep Link Navigation — Detailed Flow Diagrams

---

## System Designs

```
┌─────────────────────────────────────┐
│        Client Native App            │
│  (Swift / Kotlin)                   │
│  - Registers Firebase/OneSignal     │
│  - Receives push notification       │
│  - Creates RCTRootView              │
└────────────────┬────────────────────┘
                 │ initialProperties / native bridge
                 ▼
┌─────────────────────────────────────┐
│     Example App  (Brownfield)       │
│  (XCFramework / AAR)                │
│  - React Native root component      │
│  - Handles FCM token + permissions  │
│  - Calls navigate() on tap           │
└────────────────┬────────────────────┘
                 │ navigate() → immediate or queue
                 ▼
┌─────────────────────────────────────┐
│         UIKit  (src/)               │
│  - AmityUiKitSocial                 │
│  - NavigationContainer + ref        │
│  - onReady → onNavigationReady      │
└─────────────────────────────────────┘
```

---

## Notification Routing Logic

`handleNotificationNavigation(remoteMessage)` routes by `data.eventName`. Returns early if no `data`.

| `eventName`                                          | Screen                 | Params                              |
| ---------------------------------------------------- | ---------------------- | ----------------------------------- |
| `post.created`                                       | `CommunityProfilePage` | `{ communityId: data.communityId }` |
| `post.reacted`, `comment.created`, `comment.reacted` | `PostDetail`           | `{ postId: data.postId }`           |
| `follow.created`                                     | `UserProfile`          | `{ userId: data.publicId }`         |

---

## Flow 1 — Background, UIKit Already Mounted (Happy Path)

> User was on a UIKit screen, backgrounded the app, taps notification

```
Client Native App
  [push arrives, user taps]
        ↓
OS brings app to foreground
        ↓
Example App
  onNotificationOpenedApp fires
  handleNotificationNavigation(remoteMessage)
        ↓
  data.eventName = "comment.created"
  → navigate('PostDetail', { postId: data.postId })
        ↓
  navigationRef.isReady() = true  ← UIKit already mounted
  navigationRef.navigate('PostDetail', { postId }) immediately
        ↓
UIKit
  navigates to PostDetail ✅
```

---

## Flow 2 — Background, UIKit NOT Mounted (Client on Other Screen)

> User was on a client native screen (not UIKit), backgrounded, taps notification

```
Client Native App
  [push arrives, user taps]
        ↓
OS brings app to foreground
        ↓
Example App
  onNotificationOpenedApp fires
  handleNotificationNavigation(remoteMessage)
        ↓
  data.eventName = "post.created"
  → navigate('CommunityProfilePage', { communityId: data.communityId })
        ↓
  navigationRef.isReady() = false  ← UIKit not mounted yet
  → pendingRoute queued
        ↓
Client navigates their own stack to UIKit screen
  → AmityUiKitSocial mounts
        ↓
UIKit
  NavigationContainer fires onReady
  onNavigationReady()
  → pendingRoute exists
  → navigationRef.navigate('CommunityProfilePage', { communityId })
  → pendingRoute = null
  navigates to CommunityProfilePage ✅
```

---

## Flow 3 — Cold Start, App Was Killed

> User taps notification, app launches from scratch

```
Client Native App
  [user taps notification, app cold starts]
        ↓
RCTRootView created
        ↓
Example App mounts
  fcmToken not yet available → renders null
  permission check + token fetch runs
  fcmToken set → renders AmityUiKitSocial

  getInitialNotification() resolves
  handleNotificationNavigation(remoteMessage)
        ↓
  data.eventName = "follow.created"
  → navigate('UserProfile', { userId: data.publicId })
        ↓
  navigationRef.isReady() = false  ← UIKit not mounted yet
  → pendingRoute queued
        ↓
AmityUiKitSocial mounts
        ↓
UIKit
  NavigationContainer fires onReady
  onNavigationReady()
  → pendingRoute exists
  → navigationRef.navigate('UserProfile', { userId })
  → pendingRoute = null
  navigates to UserProfile ✅
```

---

## Flow 4 — Foreground, User Receives Notification (No Auto-Navigate)

> User is actively using the app — we do NOT auto-navigate (disruptive UX)

```
Example App
  onMessage fires (foreground notification)
        ↓
  console.log only — no navigation
  (optionally: show in-app banner, user taps → call navigate())
        ↓
UIKit stays on current screen ✅
```

---

## Pending Queue — How It Works

```
navigate(name, params)
        │
        ├─ isReady() = true  ──▶  navigationRef.navigate() immediately
        │
        └─ isReady() = false ──▶  pendingRoute = { name, params }
                                         │
                                         │  (UIKit mounts)
                                         ▼
                              NavigationContainer onReady
                                         │
                                  onNavigationReady()
                                         │
                              pendingRoute exists?
                                         │
                              YES ──▶  navigationRef.navigate()
                                       pendingRoute = null
```

---

## What Was Built

### 1. `src/core/routes/navigation.ts` (renamed from `navigationRef.ts`)

- `navigationRef` — internal, attached to `NavigationContainer`, not exported publicly
- `navigate<T>(name, params)` — public API; navigates immediately if ready, queues if not
- `onNavigationReady()` — internal; flushes pending route on UIKit mount
- `PendingRoute` — discriminated union mapped type keeping `name`/`params` correlated
- Cast: `navigationRef.navigate as typeof navigate` — resolves React Navigation's overloaded signature without `string` or `any`

### 2. `src/core/routes/AmityUIKitNavigator.tsx`

- Imports `navigationRef` + `onNavigationReady` from `./navigation`
- `<NavigationContainer ref={navigationRef} onReady={onNavigationReady}>`

### 3. `src/core/index.tsx` + `src/index.tsx`

- Exports `navigate` publicly
- `onNavigationReady` and `navigationRef` are internal only

### 4. `example/src/App.tsx`

- Imports `navigate` from the UIKit package
- `handleNotificationNavigation(remoteMessage)` — returns early if no `data`
- Routes entirely by `data.eventName` — no fallback body text check
- `onNotificationOpenedApp` + `getInitialNotification` both pass full `remoteMessage`
- `onMessage` present but only logs — no navigation (foreground UX intentionally unchanged)

---

## Edge Cases

| Scenario                              | Behavior                                          |
| ------------------------------------- | ------------------------------------------------- |
| Multiple notifications tapped quickly | Last one wins (pendingRoute is overwritten)       |
| UIKit unmounts and remounts           | onReady fires again, no pendingRoute → no-op      |
| navigate called, UIKit never mounts   | pendingRoute sits in memory, never fires          |
| UIKit already on target screen        | React Navigation deduplicates same route          |
| fcmToken not yet available            | App renders null, handlers run after token is set |
