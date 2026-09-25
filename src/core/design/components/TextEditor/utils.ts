// Mention-aware text utilities for the RN TextEditor.
// Web uses Lexical + contentEditable MentionNodes to track mentions structurally.
// RN has a plain string in a TextInput, so we track mentions as positioned
// segments over that string and reconcile their positions as the text is edited.
// This is best-effort index tracking (see reconcileMentions) — good enough for
// the composer, not a full rich-text model.

/** A committed mention segment, mirroring web `Mentioned` metadata. */
export type MentionSegment = {
  /** Index of the leading `@` in the plain text. */
  index: number;
  /** Length of the display name (excludes the `@`), matching web metadata. */
  length: number;
  /** 'user' for a specific member, 'channel' for @all. */
  type: 'user' | 'channel';
  /** userId for a user mention; '@all' for a channel mention. */
  userId: string;
  /** Display name shown in the text (without the `@`). */
  display: string;
};

const AT = '@';

/** Length of the `@display` token in the text (the `@` plus the display name). */
function tokenLength(m: MentionSegment): number {
  return m.length + AT.length;
}

/**
 * Detect an active mention query at the caret: an `@` token the caret sits
 * inside, whose `@` is at the start of the text or preceded by whitespace and
 * which contains no whitespace between the `@` and the caret. Returns the query
 * (text after `@`) and the index of the `@`, or null when the caret is not in a
 * mention token.
 */
export function detectMentionQuery(
  text: string,
  caret: number
): { query: string; start: number } | null {
  if (caret < 0 || caret > text.length) return null;

  // Walk backwards from the caret to find the `@` that opens the token.
  let i = caret - 1;
  while (i >= 0) {
    const ch = text[i];
    if (ch === AT) {
      const before = i > 0 ? text[i - 1] : undefined;
      if (before === undefined || /\s/.test(before)) {
        return { query: text.slice(i + 1, caret), start: i };
      }
      return null;
    }
    if (/\s/.test(ch)) return null;
    i -= 1;
  }
  return null;
}

/**
 * Re-position mention segments after a text edit. Uses a common prefix/suffix
 * diff: mentions fully before the change are kept, mentions fully after it are
 * shifted by the length delta, and any mention overlapping the changed region
 * is dropped (its text was touched, so it is no longer a valid mention).
 */
export function reconcileMentions(
  oldText: string,
  newText: string,
  mentions: MentionSegment[]
): MentionSegment[] {
  if (oldText === newText || mentions.length === 0) return mentions;

  const maxPrefix = Math.min(oldText.length, newText.length);
  let prefix = 0;
  while (prefix < maxPrefix && oldText[prefix] === newText[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < maxPrefix - prefix &&
    oldText[oldText.length - 1 - suffix] ===
      newText[newText.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const changeStart = prefix;
  const oldChangeEnd = oldText.length - suffix;
  const delta = newText.length - oldText.length;

  const next: MentionSegment[] = [];
  for (const m of mentions) {
    const start = m.index;
    const end = m.index + tokenLength(m);

    if (end <= changeStart) {
      next.push(m); // entirely before the edit
    } else if (start >= oldChangeEnd) {
      next.push({ ...m, index: m.index + delta }); // entirely after the edit
    }
    // else: overlaps the edit → drop it
  }
  return next;
}

/**
 * Replace the active `@query` token (from `queryStart` up to `caret`) with
 * `@display ` (trailing space) and return the new text, the new mention segment,
 * and the caret position to place after the inserted token.
 */
export function insertMentionToken(
  text: string,
  queryStart: number,
  caret: number,
  mention: { userId: string; display: string; type: 'user' | 'channel' }
): { text: string; segment: MentionSegment; caret: number } {
  const token = `${AT}${mention.display} `;
  const nextText = text.slice(0, queryStart) + token + text.slice(caret);
  const segment: MentionSegment = {
    index: queryStart,
    length: mention.display.length,
    type: mention.type,
    userId: mention.userId,
    display: mention.display,
  };
  return { text: nextText, segment, caret: queryStart + token.length };
}

/**
 * Build the SDK `mentionees` payload for createMessage/editMessage from the
 * committed mention segments. A channel mention (@all) is pushed as its own
 * entry; user mentions are collapsed into a single `userIds` entry. An empty
 * user entry is always included so the backend clears stale mentionees, matching
 * web `extractMetadata`.
 */
export function toMentionees(
  mentions: MentionSegment[]
): (Amity.UserMention | Amity.ChannelMention)[] {
  const mentionees: (Amity.UserMention | Amity.ChannelMention)[] = [];
  const hasChannel = mentions.some((m) => m.type === 'channel');
  if (hasChannel) mentionees.push({ type: 'channel' } as Amity.ChannelMention);
  mentionees.push({
    type: 'user',
    userIds: mentions.filter((m) => m.type === 'user').map((m) => m.userId),
  } as Amity.UserMention);
  return mentionees;
}
