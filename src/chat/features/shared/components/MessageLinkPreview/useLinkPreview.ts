// useLinkPreview — RN replacement for the web `usePreviewLink` hook.
// Web resolves OpenGraph metadata via a react-query hook; RN uses the SDK's
// `Client.getLinkPreviewMetadata(url)` which returns { title, description,
// domain, imageUrl }. The SDK ships the `Amity.LinkPreviewMetadata` global but
// does not wire it into its type index, so a local result type is used and the
// call is cast. Web's debounce/refetch flags collapse to a single `isLoading`.

import { useEffect, useState } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';

export type LinkPreviewResult = {
  title: string | null;
  description: string | null;
  domain: string | null;
  imageUrl: string | null;
};

export function useLinkPreview(url: string) {
  const [data, setData] = useState<LinkPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    if (url) {
      setIsLoading(true);
      setIsError(false);
      (Client.getLinkPreviewMetadata(url) as Promise<LinkPreviewResult>)
        .then((result) => {
          if (active) setData(result);
        })
        .catch(() => {
          if (active) setIsError(true);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    } else {
      setData(null);
    }
    return () => {
      active = false;
    };
  }, [url]);

  return { data, isLoading, isError };
}

// Fallback host extractor (web used chat/utils/previewLink#getHostName). Avoids
// the URL/whatwg polyfill, which RN lacks.
export function getHostName(url: string): string {
  return (
    url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split(/[/?#]/)[0] ?? ''
  );
}
