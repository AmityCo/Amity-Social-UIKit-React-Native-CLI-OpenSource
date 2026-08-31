// previewLink — faithful port of AmityUiKitWeb chat/utils/previewLink.ts.
// extractFirstPreviewUrl is ported VERBATIM (same linkifyjs `find`, same
// http→https upgrade) so RN previews the same URLs web does — including bare
// `www.`/domain URLs and URLs followed by punctuation, which a naive
// /https?:\/\/\S+/ regex silently misses or over-captures.
//
// getHostName: web uses `new URL(url).hostname`, but RN's URL implementation
// does not reliably expose `.hostname`, so we strip the host with a regex
// (behaviour-equivalent for display). The SDK metadata already returns `domain`
// directly; this is only a fallback.

import { find } from 'linkifyjs';

export function extractFirstPreviewUrl(text: string): string | null {
  if (!text) return null;

  const urls = find(text, 'url');
  if (urls.length === 0) return null;

  const { value, href } = urls[0];

  // linkifyjs defaults bare `www.foo.com` to `http://www.foo.com`; we want https.
  if (!/^https?:\/\//i.test(value) && href.startsWith('http://')) {
    return `https://${href.slice('http://'.length)}`;
  }

  return href;
}

export function getHostName(url: string): string {
  return (
    url
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split(/[/?#]/)[0] ?? ''
  );
}
