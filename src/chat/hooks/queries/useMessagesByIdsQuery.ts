// useMessagesByIdsQuery — resolves individual messages by id through
// `MessageRepository.getMessage` live objects.
//
// Web reads a reply's parent with `useMessageObject(parentId)`, which fetches the
// message on its own rather than looking it up in the loaded page. RN has no
// `useLiveObjectV4`, so this hook does the same job for a whole set of ids at
// once: one `getMessage` subscription per id, kept in a ref and diffed on every
// change so an id that is already subscribed is never torn down and re-created
// (that would flash its consumer back to a loading state each time a new page
// arrives and the id set shifts). Gated on `useAuth().isConnected`.
//
// PDT-4927: MessageList only resolved reply parents from the messages already in
// the list, so a parent sitting on an earlier page stayed unresolved and its
// quote spun forever. This hook fills those gaps.

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../core/hooks/useAuth';

export type MessageByIdEntry = {
  /** The resolved message, once the live object has delivered one. */
  message?: Amity.Message;
  /**
   * Still resolving. Turns false on the first settled callback — including an
   * errored one — so a consumer always reaches a terminal state instead of
   * showing a loader indefinitely.
   */
  loading: boolean;
};

export type UseMessagesByIdsQueryResult = {
  byId: Map<string, MessageByIdEntry>;
};

export function useMessagesByIdsQuery(
  messageIds: string[]
): UseMessagesByIdsQueryResult {
  const { isConnected } = useAuth();
  const [byId, setById] = useState<Map<string, MessageByIdEntry>>(
    () => new Map()
  );
  const unsubscribersRef = useRef(new Map<string, Amity.Unsubscriber>());

  // A stable key for the requested set: the effect below must re-run when the
  // ids change, not on every new array identity (MessageList rebuilds the list
  // on each render).
  const idsKey = useMemo(
    () =>
      Array.from(new Set(messageIds.filter(Boolean)))
        .sort()
        .join(','),
    [messageIds]
  );

  useEffect(() => {
    const subscriptions = unsubscribersRef.current;
    // Disconnected: hold no subscriptions at all. The diff below then tears down
    // everything, and reconnecting re-subscribes from scratch.
    const wanted = new Set(
      isConnected && idsKey.length > 0 ? idsKey.split(',') : []
    );

    const dropped: string[] = [];
    subscriptions.forEach((unsubscribe, id) => {
      if (wanted.has(id)) return;
      unsubscribe();
      subscriptions.delete(id);
      dropped.push(id);
    });

    const added = Array.from(wanted).filter((id) => !subscriptions.has(id));

    if (dropped.length > 0 || added.length > 0) {
      setById((prev) => {
        const next = new Map(prev);
        dropped.forEach((id) => next.delete(id));
        added.forEach((id) => next.set(id, { loading: true }));
        return next;
      });
    }

    added.forEach((id) => {
      subscriptions.set(
        id,
        MessageRepository.getMessage(id, ({ data, loading, error }) => {
          setById((prev) => {
            const next = new Map(prev);
            next.set(id, {
              message: data ?? undefined,
              // An errored live object is settled, not loading — otherwise a
              // parent that can never be fetched keeps its consumer spinning.
              loading: !error && loading,
            });
            return next;
          });
        })
      );
    });

    return undefined;
  }, [isConnected, idsKey]);

  // Tear every subscription down on unmount. Kept separate from the diffing
  // effect above, which must NOT unsubscribe on each re-run.
  useEffect(() => {
    const subscriptions = unsubscribersRef.current;
    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
      subscriptions.clear();
    };
  }, []);

  return { byId };
}
