/**
 * pendingVisitorJoin
 *
 * Bridges the visitor "Join community" tap to the moment the visitor becomes a
 * signed-in user, so the UIKit can auto-join that community once joining is
 * allowed.
 *
 * A visitor cannot join a community (read-only session). When a visitor taps
 * Join, `useGlobalBehavior` records the tapped communityId here, then the host
 * runs its sign-in / create-profile flow. When `AuthProvider` sees the session
 * become `signed-in`, it consumes this value and performs the join.
 *
 * A module-level store (not React context) is used because the recorder
 * (useGlobalBehavior, deep in the social tree) and the consumer (AuthProvider,
 * at the root) live in different subtrees; a singleton is the simplest reliable
 * channel between them.
 */

let pendingCommunityId: string | undefined;

/** Record the community a visitor tapped Join on, to auto-join after sign-in. */
export const setPendingVisitorJoin = (communityId?: string): void => {
  pendingCommunityId = communityId;
};

/** Read and clear the pending community id (consume-once). */
export const consumePendingVisitorJoin = (): string | undefined => {
  const id = pendingCommunityId;
  pendingCommunityId = undefined;
  return id;
};

// Listeners notified once the auto-join has completed on the network. Screens
// that filter by join state (e.g. Explore's recommended list) subscribe so they
// can re-fetch — otherwise they may have loaded before the async join finished
// and would show stale (pre-join) results.
const joinCompletedListeners = new Set<() => void>();

/** Subscribe to auto-join completion. Returns an unsubscribe fn. */
export const onVisitorAutoJoinCompleted = (
  listener: () => void
): (() => void) => {
  joinCompletedListeners.add(listener);
  return () => joinCompletedListeners.delete(listener);
};

/** Fire after the auto-join network call resolves. */
export const notifyVisitorAutoJoinCompleted = (): void => {
  joinCompletedListeners.forEach((listener) => listener());
};
