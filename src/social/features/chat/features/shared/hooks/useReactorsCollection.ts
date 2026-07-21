// useReactorsCollection — RN port of AmityUiKitWeb
// v4/core/hooks/collections/useReactionsCollection.ts. Web wraps
// ReactionRepository.getReactions in the generic useLiveCollectionV4; RN has no
// such hook, so this subscribes to the getReactions live collection directly
// (same callback/pagination contract) and exposes the same shape the reactor
// sheet consumes: reactors + loading flags + hasMore/loadMore.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactionRepository } from '@amityco/ts-sdk-react-native';

type UseReactorsCollectionParams = {
  referenceId: string;
  referenceType: Amity.ReactableType;
  reactionName?: string;
  limit?: number;
};

export type UseReactorsCollectionReturn = {
  reactors: Amity.Reactor[];
  isLoading: boolean;
  isLoadingFirstPage: boolean;
  hasMore: boolean;
  loadMore: () => void;
};

export function useReactorsCollection({
  referenceId,
  referenceType,
  reactionName,
  limit = 25,
}: UseReactorsCollectionParams): UseReactorsCollectionReturn {
  const [reactors, setReactors] = useState<Amity.Reactor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFirstPage, setIsLoadingFirstPage] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const onNextPageRef = useRef<(() => void) | undefined>(undefined);

  // Matches web useReactionsCollection: fetch as soon as we have a reference.
  const shouldCall = !!referenceId && !!referenceType;

  useEffect(() => {
    if (!shouldCall) return undefined;

    setReactors([]);
    setIsLoadingFirstPage(true);
    setIsLoading(true);

    const query: Amity.ReactionLiveCollection = {
      referenceId,
      referenceType,
      limit,
      ...(reactionName ? { reactionName } : {}),
    };

    const unsubscribe = ReactionRepository.getReactions(query, (result) => {
      setReactors(result.data ?? []);
      setIsLoading(result.loading);
      onNextPageRef.current = result.onNextPage;
      setHasMore(!!result.hasNextPage);
      if (!result.loading) setIsLoadingFirstPage(false);
    });

    return () => unsubscribe();
  }, [referenceId, referenceType, reactionName, limit, shouldCall]);

  const loadMore = useCallback(() => {
    onNextPageRef.current?.();
  }, []);

  return { reactors, isLoading, isLoadingFirstPage, hasMore, loadMore };
}
