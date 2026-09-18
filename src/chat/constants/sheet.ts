// Geometry for chat bottom sheets.
//
// The reactor list is a half-height sheet: tall enough to show several rows and
// still scroll, short enough that the message it belongs to stays visible behind
// it. It is deliberately not a tall/near-full-screen drawer — at that size the
// sheet reads as a page of its own and loses the connection to the bubble that
// opened it.

import { Dimensions } from 'react-native';

/** The reactor sheet takes half the height of the screen it opens over. */
export const REACTOR_SHEET_HEIGHT_RATIO = 0.5;

/**
 * The reactor sheet's height for the current layout.
 *
 * The ratio is taken against the WINDOW, not against the chat page: the sheet
 * is anchored to the bottom of the screen, so a ratio of the page would put its
 * top edge at the page's midpoint rather than the screen's, and it reads as
 * sitting too low by exactly the height of whatever chrome the host app draws
 * above the page. The design frames this sheet at 418 of an 812 device, with no
 * host chrome in the frame at all.
 *
 * `surfaceHeight` — the chat page's own measured box (see useChatSurfaceHeight)
 * — is only a ceiling. A host that leaves the page shorter than half the screen
 * would otherwise get a sheet tall enough to cover the chat header behind it,
 * which is the failure the page measurement exists to prevent.
 *
 * Call this at open time rather than caching it, so a rotation or split-screen
 * resize re-resolves the ratio.
 */
export const getReactorSheetHeight = (surfaceHeight?: number) => {
  const half = Math.round(
    Dimensions.get('window').height * REACTOR_SHEET_HEIGHT_RATIO
  );
  return surfaceHeight == null ? half : Math.min(half, surfaceHeight);
};
