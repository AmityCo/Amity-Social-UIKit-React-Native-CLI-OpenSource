// highlightMatch — splits `text` around the occurrences of `query` that START a
// word, wrapping each one in a nested <Text> styled with the highlight colour.
// Returns the raw string when the query is shorter than SEARCH_MIN_QUERY_LENGTH.
// Matching is case-insensitive.

import type { ReactNode } from 'react';
import { Text, type TextStyle } from 'react-native';
import { SEARCH_MIN_QUERY_LENGTH } from '../constants/search';

// Search matches words by prefix, so a hit in the middle of a word ("cat" inside
// "bobcat") is not something the query actually found and must not be painted.
//
// The boundary test is deliberately narrow: a match is rejected only when an
// ASCII letter or digit sits immediately before it. Scripts written without
// spaces — Thai, Chinese, Japanese — have no word separators at all, so a regex
// `\b` (or any rule that demands a separator) would stop highlighting them
// entirely. Treating their characters as non-word means every occurrence there
// still counts as a word start, which is the safe direction to be wrong in.
const ASCII_WORD_CHAR = /[a-z0-9]/;

// `lowerText` is already lower-cased, so the class only needs the lower half.
const startsWord = (lowerText: string, index: number): boolean =>
  index === 0 || !ASCII_WORD_CHAR.test(lowerText.charAt(index - 1));

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
  // `cursor` is how far the output has been emitted; it only moves past an
  // ACCEPTED match, so a rejected one stays in the plain-text run. A rejected
  // match advances the scan by a single character instead of a whole query
  // length, so an overlapping candidate right behind it is still seen.
  let cursor = 0;
  let matchAt = lowerText.indexOf(lowerQuery, 0);

  while (matchAt !== -1) {
    if (!startsWord(lowerText, matchAt)) {
      matchAt = lowerText.indexOf(lowerQuery, matchAt + 1);
      continue;
    }

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
