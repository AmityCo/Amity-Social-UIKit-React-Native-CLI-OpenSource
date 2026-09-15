// useChatUser — live user object for a chat surface.
//
// LEADS WEB. Web's ChannelItem reads the other participant straight off
// `channel.previewMembers[].user`, and so did this port. That embedded snapshot
// is whatever the channel payload carried when the channel was cached, so it
// never reflects a user who was soft-deleted afterwards — the chat list kept
// showing the original display name instead of "Deleted user"
// (PDT-5192 / PDT-5198).
//
// Subscribing to the user object gives the row the current state. Same shape and
// gating as the sibling useFollowInfo: a direct repository subscription (RN has
// no `useLiveObjectV4`), gated on `useAuth().isConnected` because the SDK throws
// before the session is established, and torn down on unmount / id change.
//
// `enabled` exists so a caller can subscribe for conversation rows only — a
// group row has no single counterpart and must not open a subscription.

import { useEffect, useState } from 'react';
import { UserRepository } from '@amityco/ts-sdk-react-native';

import useAuth from '../../core/hooks/useAuth';

export function useChatUser(
  userId?: string,
  { enabled = true }: { enabled?: boolean } = {}
): Amity.User | undefined {
  const { isConnected } = useAuth();
  const [user, setUser] = useState<Amity.User | undefined>(undefined);

  useEffect(() => {
    if (!isConnected || !enabled || !userId) {
      // Drop anything resolved for a previous id so a stale user can never leak
      // into the next row this hook instance is recycled for.
      setUser(undefined);
      return undefined;
    }
    const unsub = UserRepository.getUser(userId, ({ data }) => {
      if (data) setUser(data);
    });
    return () => {
      unsub();
    };
  }, [isConnected, enabled, userId]);

  return user;
}
