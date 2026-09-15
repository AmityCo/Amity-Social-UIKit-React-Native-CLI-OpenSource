// useMention — RN port of AmityUiKitWeb v4/chat/hooks/useMention +
// useChannelMentionSuggestion. Web relies on Lexical typeahead plugins; here the
// hook is search-only and feeds the composer's mention overlay. Given an
// `@query`, it searches channel members (ChannelRepository.Membership.searchMembers)
// when a channelId is provided, otherwise all users
// (UserRepository.searchUserByDisplayName), and returns suggestions the composer
// maps into a TextEditor mention via `toMention`.
//
// SDK live collections need a connected client, so every subscription is gated
// on useAuth().isConnected (same pattern as collections/useChannelsCollection).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChannelRepository,
  UserRepository,
} from '@amityco/ts-sdk-react-native';

import useAuth from '../../core/hooks/useAuth';
import { resolveString } from '../../core/localization';

export type MentionSuggestion = {
  userId: string;
  display: string;
  avatarUrl?: string;
  type: 'user' | 'channel';
};

export type UseMentionParams = {
  /** Channel to scope member search to. Falls back to global user search when unset. */
  channelId?: string;
  /** Include the `@all` channel mention option (web gates this on moderator role). */
  includeChannelMention?: boolean;
  limit?: number;
};

export type UseMentionResult = {
  query: string | null;
  setQuery: (query: string | null) => void;
  suggestions: MentionSuggestion[];
  isSearching: boolean;
  reset: () => void;
  /** Map a picked suggestion into the shape TextEditor.insertMention expects. */
  toMention: (suggestion: MentionSuggestion) => {
    userId: string;
    display: string;
    type: 'user' | 'channel';
  };
};

const DEFAULT_LIMIT = 20;
const CHANNEL_ALL_ID = 'all';

function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function useMention({
  channelId,
  includeChannelMention = false,
  limit = DEFAULT_LIMIT,
}: UseMentionParams = {}): UseMentionResult {
  const { isConnected } = useAuth();
  const [query, setQuery] = useState<string | null>(null);
  const [users, setUsers] = useState<MentionSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const unsubRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // No active `@query` → nothing to search; tear down any live subscription.
    if (query === null || !isConnected) {
      unsubRef.current?.();
      unsubRef.current = undefined;
      setUsers([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    // Web treats an empty / bare `@` query as "no keyword" (list default members).
    const keyword = query.trim() === '' ? undefined : query.trim();

    unsubRef.current?.();

    if (channelId) {
      unsubRef.current = ChannelRepository.Membership.searchMembers(
        { channelId, search: keyword, memberships: ['member'], limit },
        ({ data, loading }) => {
          if (loading) return;
          setUsers(
            data
              .map((member) => ({
                userId: member.user?.userId ?? member.userId,
                display:
                  member.user?.displayName ??
                  member.user?.userId ??
                  member.userId,
                avatarUrl: member.user?.avatarCustomUrl,
                type: 'user' as const,
              }))
              .filter((s) => isNonNullable(s.userId))
          );
          setIsSearching(false);
        }
      );
    } else {
      unsubRef.current = UserRepository.searchUserByDisplayName(
        { displayName: keyword ?? '', limit },
        ({ data, loading }) => {
          if (loading) return;
          setUsers(
            data.map((user) => ({
              userId: user.userId,
              display: user.displayName ?? user.userId,
              avatarUrl: user.avatarCustomUrl,
              type: 'user' as const,
            }))
          );
          setIsSearching(false);
        }
      );
    }

    return () => {
      unsubRef.current?.();
      unsubRef.current = undefined;
    };
  }, [query, channelId, isConnected, limit]);

  const suggestions = useMemo<MentionSuggestion[]>(() => {
    // Prepend @all for group channels when enabled and the query matches "all".
    const showAll =
      includeChannelMention &&
      channelId != null &&
      (query === '' || /^al*l*$/i.test(query ?? ''));

    if (!showAll) return users;
    return [
      {
        userId: CHANNEL_ALL_ID,
        display: resolveString('amity_chat_tab_all'),
        type: 'channel' as const,
      },
      ...users,
    ];
  }, [users, includeChannelMention, channelId, query]);

  const reset = useCallback(() => {
    setQuery(null);
    setUsers([]);
    setIsSearching(false);
  }, []);

  const toMention = useCallback(
    (suggestion: MentionSuggestion) => ({
      userId: suggestion.userId,
      display: suggestion.display,
      type: suggestion.type,
    }),
    []
  );

  return { query, setQuery, suggestions, isSearching, reset, toMention };
}
