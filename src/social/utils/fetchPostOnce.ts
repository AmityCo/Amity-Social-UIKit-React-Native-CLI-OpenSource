import { PostRepository } from '@amityco/ts-sdk-react-native';

/** How long one read may wait for the SDK to settle before giving up. */
export const FETCH_POST_TIMEOUT_MS = 15000;
/** Pause before the single retry after a failed read. */
export const FETCH_POST_RETRY_DELAY_MS = 1500;

type ReadResult = { ok: true; post?: Amity.Post } | { ok: false };

function readPost(postId: string): Promise<ReadResult> {
  return new Promise((resolve) => {
    let settled = false;
    let unsubscribe: (() => void) | undefined;

    const settle = (result: ReadResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
      // Unset when the SDK answered synchronously, before getPost returned;
      // closed just below in that case.
      unsubscribe?.();
    };

    const timer = setTimeout(
      () => settle({ ok: false }),
      FETCH_POST_TIMEOUT_MS
    );

    unsubscribe = PostRepository.getPost(postId, ({ data, loading, error }) => {
      if (error) settle({ ok: false });
      else if (!loading) settle({ ok: true, post: data });
    });
    if (settled) unsubscribe();
  });
}

/**
 * Reads a post once: subscribes, resolves with the first settled answer and
 * closes the subscription straight away. Undefined when it can't be read (an
 * error, or no answer within 15 s), after one retry.
 *
 * Use it instead of the legacy getPostById, which resolves before the data has
 * arrived and never unsubscribes, leaving a live post subscription behind on
 * every call.
 */
export async function fetchPostOnce(
  postId: string
): Promise<Amity.Post | undefined> {
  const first = await readPost(postId);
  if (first.ok) return first.post;

  await new Promise((resolve) =>
    setTimeout(resolve, FETCH_POST_RETRY_DELAY_MS)
  );
  const second = await readPost(postId);
  return second.ok ? second.post : undefined;
}
