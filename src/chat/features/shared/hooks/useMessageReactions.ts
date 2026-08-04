// useMessageReactions — RN port of AmityUiKitWeb
// v4/chat/hooks/queries/useMessageReactionQuery.ts. Add / remove / toggle a
// reaction on a message, with the same optimistic-then-rollback behaviour web
// gets from react-query's onError.
//
// The real mutation runs through the message-level `message.addReaction()` /
// `message.removeReaction()` methods, exactly as web does. These update the
// message model's Reactable fields (`reactions`, `reactionsCount`,
// `myReactions`) that MessageReactionBadge reads, so the live collection reflects
// the change and the badge appears immediately (own side included). A plain
// `ReactionRepository.addReaction(referenceType, referenceId, name)` call writes
// the reaction collection but does not propagate to those derived message fields,
// which is why an earlier port left own reactions invisible. The repository
// `.optimistically` calls are kept only for the optimistic pre-update and the
// error rollback — matching web's onError handlers.

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
      // Web: `message.addReaction(reactionName)` — updates the message model's
      // reaction fields so the live badge reflects it.
      await message.addReaction(reactionName);
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
      // Web: `message.removeReaction(reactionName)`.
      await message.removeReaction(reactionName);
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
