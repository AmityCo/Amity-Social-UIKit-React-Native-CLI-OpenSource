import { useEffect, useState } from 'react';
import { PostRepository } from '@amityco/ts-sdk-react-native';

/**
 * Resolve a list of post ids to their loaded post objects — the same approach
 * the web UIKit uses (core/hooks/usePostByIds) to load an edited post's child
 * media. Reads the cache first and falls back to the batch `getPostByIds` API.
 * Nothing stays subscribed, so it adds no handlers to the SDK's post events.
 */
export const usePostByIds = (postIds: string[]) => {
  // Depend on a stable string key so a fresh `[]`/array identity each render
  // doesn't re-trigger the effect (and loop).
  const key = (postIds ?? []).join(',');
  const [resolved, setResolved] = useState<{
    key: string;
    posts: Amity.Post[];
  }>({ key: '', posts: [] });

  useEffect(() => {
    if (!key) {
      setResolved({ key, posts: [] });
      return undefined;
    }

    const ids = key.split(',');
    const cached = PostRepository.getPostByIds.locally(ids)?.data;
    if (cached?.length === ids.length) {
      setResolved({ key, posts: cached });
      return undefined;
    }

    let active = true;
    PostRepository.getPostByIds(ids)
      .then(({ data }) => {
        if (active) setResolved({ key, posts: data });
      })
      .catch(() => {
        if (active) setResolved({ key, posts: [] });
      });
    return () => {
      active = false;
    };
  }, [key]);

  return {
    posts: resolved.posts,
    isLoading: !!key && resolved.key !== key,
  };
};
