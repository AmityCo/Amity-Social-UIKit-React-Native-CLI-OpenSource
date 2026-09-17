// Geometry for chat bottom sheets.
//
// The reactor list is a half-height sheet: tall enough to show several rows and
// still scroll, short enough that the message it belongs to stays visible behind
// it. It is deliberately not a tall/near-full-screen drawer — at that size the
// sheet reads as a page of its own and loses the connection to the bubble that
// opened it.

import { Dimensions } from 'react-native';

/** The reactor sheet takes half the height of the page it opens over. */
export const REACTOR_SHEET_HEIGHT_RATIO = 0.5;

/**
 * The reactor sheet's height for the current layout.
 *
 * `surfaceHeight` is the chat page's own measured box (see useChatSurfaceHeight)
 * and is what the ratio should be taken against: a host app that mounts the
 * UIKit under its own chrome leaves the page smaller than the device screen, so
 * measuring against `Dimensions` there yields a sheet that is half the DEVICE
 * but much more than half the page. The window is only the fallback for the
 * frames before the page has been laid out once.
 *
 * Call this at open time rather than caching it, so a rotation or split-screen
 * resize re-resolves the ratio.
 */
export const getReactorSheetHeight = (surfaceHeight?: number) =>
  Math.round(
    (surfaceHeight ?? Dimensions.get('window').height) *
      REACTOR_SHEET_HEIGHT_RATIO
  );
