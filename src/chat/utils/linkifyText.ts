// linkifyText — one URL scanner for every place chat renders message text.
//
// This replaces three hand-rolled copies of
// `/(https?:\/\/[^\s]+|www\.[^\s]+)/gi`, which got two ordinary cases wrong:
//
//   - a bare domain (`amity.co/docs`) matched nothing at all, so it rendered as
//     plain text while the `https://` and `www.` links beside it were styled —
//     a message with three links could show only two as hyperlinks;
//   - trailing punctuation was swallowed, so `https://amity.co,` opened a URL
//     with the comma attached.
//
// `linkifyjs` already backs previewLink.ts, which picks the URL for the link
// preview card. Running every renderer through the same tokenizer keeps what is
// underlined and what gets a preview card in agreement.

import { find } from 'linkifyjs';

export type TextSegment =
  | { kind: 'text'; value: string }
  | { kind: 'link'; value: string; href: string };

// linkifyjs defaults a scheme-less `amity.co` to `http://amity.co`; we open
// https instead, as extractFirstPreviewUrl does.
function toHttps(value: string, href: string): string {
  if (!/^https?:\/\//i.test(value) && href.startsWith('http://')) {
    return `https://${href.slice('http://'.length)}`;
  }
  return href;
}

/** Split `text` into plain runs and URL runs, in order. */
export function splitTextByLinks(text: string): TextSegment[] {
  if (!text) return [];

  const links = find(text, 'url');
  if (links.length === 0) return [{ kind: 'text', value: text }];

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const link of links) {
    if (link.start > cursor) {
      segments.push({ kind: 'text', value: text.slice(cursor, link.start) });
    }
    segments.push({
      kind: 'link',
      value: link.value,
      href: toHttps(link.value, link.href),
    });
    cursor = link.end;
  }

  if (cursor < text.length) {
    segments.push({ kind: 'text', value: text.slice(cursor) });
  }

  return segments;
}
