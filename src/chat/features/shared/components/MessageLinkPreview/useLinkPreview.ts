// useLinkPreview — RN replacement for the web `usePreviewLink` hook.
// Web resolves OpenGraph metadata via a react-query hook; RN uses the SDK's
// `Client.getLinkPreviewMetadata(url)`. Web's debounce/refetch flags collapse to
// a single `isLoading`.
//
// PDT-4912 / PDT-5308: both SDKs return the `/api/v1/link-preview` payload
// VERBATIM — neither maps its fields. Web therefore normalises the raw payload in
// v4/utils/previewLink.ts#getLinkPreviewMetadata:
//   `{ ...data, title: data.title || '', imageUrl: data.image || '', domain: ... }`
// i.e. the API delivers the thumbnail under `image`, and web renames it to
// `imageUrl`. The RN port skipped that normalisation and read `data.imageUrl`
// straight off the raw payload — always `undefined` — so `hasUsableImage` was
// false for every link and the card always fell back to the broken-image glyph.
// (The RN SDK's hand-written `Amity.LinkPreviewMetadata` d.ts declares `imageUrl`,
// which is why the mismatch type-checked; the runtime object never carries it.)
// We normalise here, exactly as web does, reading `image` and keeping `imageUrl`
// as a forward-compatible fallback should the SDK ever align with its own types.

import { useEffect, useState } from 'react';
import { Client } from '@amityco/ts-sdk-react-native';

/** Normalised shape the component consumes (mirrors web's PreviewMetadataCacheType). */
export type LinkPreviewResult = {
  title: string;
  description: string;
  domain: string;
  imageUrl: string;
};

/** The raw `/api/v1/link-preview` payload, as both SDKs hand it back untouched. */
type RawLinkPreviewMetadata = {
  title?: string | null;
  description?: string | null;
  domain?: string | null;
  /** The API's thumbnail field — what web maps to `imageUrl`. */
  image?: string | null;
  /** Declared by the RN SDK's d.ts but absent at runtime; kept as a fallback. */
  imageUrl?: string | null;
};

// Web: getLinkPreviewMetadata() in v4/utils/previewLink.ts.
function normalizeLinkPreview(raw: RawLinkPreviewMetadata): LinkPreviewResult {
  return {
    title: raw.title || '',
    description: raw.description || '',
    domain: raw.domain || '',
    imageUrl: raw.image || raw.imageUrl || '',
  };
}

export function useLinkPreview(url: string) {
  const [data, setData] = useState<LinkPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    if (url) {
      setIsLoading(true);
      setIsError(false);
      (
        Client.getLinkPreviewMetadata(
          url
        ) as unknown as Promise<RawLinkPreviewMetadata>
      )
        .then((result) => {
          if (active) setData(normalizeLinkPreview(result));
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
