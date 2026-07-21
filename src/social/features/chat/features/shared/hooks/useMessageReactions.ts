// useMessageReactions — RN port of AmityUiKitWeb
// v4/chat/hooks/queries/useMessageReactionQuery.ts. Add / remove / toggle a
// reaction on a message via ReactionRepository (reference-type = 'message'),
// with the same optimistic-then-rollback behaviour web gets from react-query's
// onError. Web called `message.addReaction()` and only used the repository for
// the optimistic rollback; the task pins the data layer to ReactionRepository's
// add/remove API, which is behaviourally identical (same endpoint, same cache).

import { ReactionRepository } from '@amityco/ts-sdk-react-native';

const REFERENCE_TYPE: Amity.ReactableType = 'message';

export type MessageReactionPayload = {
  message: Amity.Message;
  reactionName: string;
};

export type UseMessageReactionsReturn = {
  addReaction: (payload: MessageReactionPayload) => Promise<void>;
  removeReaction: (payload: MessageReactionPayload) => Promise<void>;
  /** Toggle: re-tap removes; a different reaction replaces the current one. */
  selectReaction: (payload: MessageReactionPayload) => Promise<void>;
};

export function useMessageReactions(): UseMessageReactionsReturn {
  async function addReaction({
    message,
    reactionName,
  }: MessageReactionPayload): Promise<void> {
    if (!message.messageId) return;
    try {
      await ReactionRepository.addReaction(
        REFERENCE_TYPE,
        message.messageId,
        reactionName
      );
    } catch {
      // Roll back the optimistic add (mirrors web's onError).
      ReactionRepository.removeReaction.optimistically(
        REFERENCE_TYPE,
        message.messageId,
        reactionName
      );
    }
  }

  async function removeReaction({
    message,
    reactionName,
  }: MessageReactionPayload): Promise<void> {
    if (!message.messageId) return;
    try {
      await ReactionRepository.removeReaction(
        REFERENCE_TYPE,
        message.messageId,
        reactionName
      );
    } catch {
      ReactionRepository.addReaction.optimistically(
        REFERENCE_TYPE,
        message.messageId,
        reactionName
      );
    }
  }

  async function selectReaction({
    message,
    reactionName,
  }: MessageReactionPayload): Promise<void> {
    if (!message.messageId) return;

    const myReactions = message.myReactions ?? [];
    const isAlreadySelected = myReactions.includes(reactionName);

    if (isAlreadySelected) {
      await removeReaction({ message, reactionName });
      return;
    }

    // Single-reaction model: drop the existing reaction before adding the new.
    if (myReactions.length > 0) {
      await removeReaction({ message, reactionName: myReactions[0] });
    }
    ReactionRepository.addReaction.optimistically(
      REFERENCE_TYPE,
      message.messageId,
      reactionName
    );
    await addReaction({ message, reactionName });
  }

  return { addReaction, removeReaction, selectReaction };
}
