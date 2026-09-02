// Chat-bubble geometry, from the design SoT
// (cleverden front-end-tech-specs/UIKIT/components/AmityMessageBubble/v2.md).
//
// The bubble's max width is a RULE, not a fixed size. The designer states it as
// an annotation rather than a layer constraint — "Chat bubble condition · Max
// width = 60% vw" — which is why every geometry extraction we run is blind to
// it. Every other platform conforms: web `max-width: 60vw`, Flutter
// `size.width * 0.6`, iOS `UIScreen.main.bounds.width * 0.6`, Android
// `(screenWidthDp * 0.6f).dp`.
//
// The 228 / 258 / 240 figures in that spec's tables are the rule's values on
// Figma's 375px artboard, NOT the contract. Android hardcoded 228 and therefore
// rendered ~228dp on every screen size — 55.6% on a 411dp device, and it would
// have stayed at 228 on a tablet where 60% is 288. Do not reintroduce a fixed
// pixel cap here.
//
// The rule targets the bubble's *message content* (Figma `ChatBubble / Message
// Content` = 228) and NOT the whole row (`ChatBubble` = 343, which includes the
// avatar and the timestamp). Those two must not consume the bubble's budget —
// that was the mechanism of the Android defect, where a cap on the row shared
// with the timestamp made the bubble's width vary with the clock string.

import { Dimensions } from 'react-native';

/** "Max width = 60% vw" — the designer's stated rule. */
export const BUBBLE_MAX_WIDTH_RATIO = 0.6;

/**
 * The bubble content's max width for the current window.
 *
 * Call this from inside `useStyles` rather than caching it at module scope, so
 * a rotation or a split-screen resize re-resolves the rule instead of keeping
 * the width the app happened to launch at.
 */
export const getBubbleMaxWidth = () =>
  Math.round(Dimensions.get('window').width * BUBBLE_MAX_WIDTH_RATIO);

// --- Media bubbles -----------------------------------------------------------
//
// Web sizes a media bubble by locking the HEIGHT and letting the width shrink to
// fit the media's own ratio — there is no ratio table, no min/max ratio clamp
// and no JS measurement:
//
//   .imageBubble  { min-height: 15rem; max-height: 15rem; max-width: 20rem }
//   .videoBubble  { min-height: 15rem; max-height: 15rem; max-width: 15rem }
//
// i.e. height is always 240 and width = 240 × (w / h), capped at 320 for images
// and 240 for video. Cropping therefore only engages past 320/240 = 4:3 for an
// image; portrait media is never cropped. Only the loading and broken
// placeholders are a true 240×240 square.
//
// The design SoT records media as a flat `maxWidth: 240` and raises it as an
// open designer question ("Unclear whether media should follow 60% or stay a
// fixed 240 square"; Android leaves media at 240). We follow web here because
// PDT-4916 explicitly cites the web mobile UIKit as the expected result — under
// a 240 cap a landscape image would still render 1:1, which is the bug.

export const MEDIA_BUBBLE_HEIGHT = 240;
export const MEDIA_BUBBLE_MAX_WIDTH_IMAGE = 320;
export const MEDIA_BUBBLE_MAX_WIDTH_VIDEO = 240;

/**
 * Web's media-bubble box for a piece of media whose intrinsic size is known.
 *
 * Returns `null` when the intrinsic size is not usable yet (not measured, or a
 * zero/NaN dimension), so callers can fall back to the square placeholder box
 * rather than dividing by zero.
 */
export const getMediaBubbleSize = (
  intrinsicWidth: number | undefined,
  intrinsicHeight: number | undefined,
  maxWidth: number
): { width: number; height: number } | null => {
  if (
    !intrinsicWidth ||
    !intrinsicHeight ||
    !Number.isFinite(intrinsicWidth) ||
    !Number.isFinite(intrinsicHeight)
  ) {
    return null;
  }

  const width = Math.round(
    Math.min((MEDIA_BUBBLE_HEIGHT * intrinsicWidth) / intrinsicHeight, maxWidth)
  );

  return { width, height: MEDIA_BUBBLE_HEIGHT };
};
