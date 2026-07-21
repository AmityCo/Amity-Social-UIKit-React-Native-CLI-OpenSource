// highlightMatch — faithful port of AmityUiKitWeb chat/utils/highlightMatch.
// Splits `text` around case-insensitive occurrences of `query`, wrapping each
// match in a nested <Text> styled with the highlight colour (web wrapped matches
// in a <span className=…>). Returns the raw string when the query is shorter than
// SEARCH_MIN_QUERY_LENGTH, matching web.

import type { ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';
import { SEARCH_MIN_QUERY_LENGTH } from '../constants/search';

export function highlightMatch(
  text: string,
  query: string,
  highlightStyle: TextStyle
): ReactNode {
  if (text.length === 0) return text;
  const trimmed = query.trim();
  if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();

  const parts: ReactNode[] = [];
  let cursor = 0;
  let matchAt = lowerText.indexOf(lowerQuery, cursor);

  while (matchAt !== -1) {
    if (matchAt > cursor) parts.push(text.slice(cursor, matchAt));
    parts.push(
      <Text key={`m-${matchAt}`} style={highlightStyle}>
        {text.slice(matchAt, matchAt + trimmed.length)}
      </Text>
    );
    cursor = matchAt + trimmed.length;
    matchAt = lowerText.indexOf(lowerQuery, cursor);
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length > 0 ? parts : text;
}
