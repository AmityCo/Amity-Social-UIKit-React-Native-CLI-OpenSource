import { useEffect, useState } from 'react';
import { PostRepository } from '@amityco/ts-sdk-react-native';

/**
 * Resolve a list of post ids to their loaded post objects — the same approach
 * the web UIKit uses (core/hooks/usePostByIds) to load an edited post's child
 * media. Uses the batch `getPostByIds` API, which is properly awaited, instead
 * of the racy per-id live-object fetch.
 *
 * `settled` flips once the fetch has finished — resolved, empty, or failed. An
 * empty `posts` alone can't tell those apart, so callers that gate UI on the
 * children being known must read `settled`, not `posts.length`.
 */
export const usePostByIds = (postIds: string[]) => {
  const [posts, setPosts] = useState<Amity.Post[]>([]);
  const [settled, setSettled] = useState(false);
  // Depend on a stable string key so a fresh `[]`/array identity each render
  // doesn't re-trigger the effect (and loop).
  const key = (postIds ?? []).join(',');

  useEffect(() => {
    let active = true;
    async function run() {
      if (!key) {
        setPosts((prev) => (prev.length ? [] : prev));
        setSettled(true);
        return;
      }
      setSettled(false);
      try {
        const response = await PostRepository.getPostByIds(key.split(','));
        if (active) setPosts(response.data);
      } catch (error) {
        console.log('usePostByIds error: ', error);
      } finally {
        if (active) setSettled(true);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [key]);

  return { posts, settled };
};
