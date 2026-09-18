// Styles for BottomSheet, read off the design: a 20-radius top, a 36x4 handle
// in a 28-high strip, and the bottom safe-area inset on the sheet itself, since
// a bottom sheet's lower edge sits on the screen edge (home indicator / gesture
// bar).

import { StyleSheet } from 'react-native';

import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Design geometry: a 28-high strip holding a 36x4 pill, which is 12 of padding
// above and below it. The strip is only the visual handle — the whole sheet is
// draggable — so it does not need to be oversized as a touch target.
const HANDLE_STRIP_HEIGHT = 28;
const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;
const SHEET_RADIUS = 20;
// The design leaves 32 below the sheet's content and another 32 for the home
// indicator — 64 in all. The safe-area inset on the sheet already covers most
// of that, and the heights callers ask for carry slack of their own, so the
// part that still has to be added here is the remainder, not the whole 32.
const CONTENT_BOTTOM_GAP = 12;
// The dark sheet is opened over a dark page (the media viewers), where the
// themed surface would read as a light panel on black.
const DARK_SHEET_SURFACE = '#191919';

export const useStyles = ({ dark }: { dark?: boolean } = {}) => {
  const token = useToken();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#000000',
    },
    backdropPressable: {
      flex: 1,
    },
    sheet: {
      width: '100%',
      borderTopLeftRadius: SHEET_RADIUS,
      borderTopRightRadius: SHEET_RADIUS,
      paddingBottom: insets.bottom,
      backgroundColor: dark
        ? DARK_SHEET_SURFACE
        : token(AmityColorToken.SurfaceSheetsBackgroundGeneral),
      // The sheet closes by shrinking to nothing, and its children do not shrink
      // with it — the handle strip is a fixed 28 — so without this they spill
      // out of the shrinking box and stay on screen until the sheet unmounts,
      // which reads as the last of the sheet vanishing a beat late. Clipping is
      // free here: this view casts no shadow for it to cut off.
      overflow: 'hidden',
    },
    handleArea: {
      height: HANDLE_STRIP_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    handle: {
      width: HANDLE_WIDTH,
      height: HANDLE_HEIGHT,
      borderRadius: HANDLE_HEIGHT / 2,
      backgroundColor: token(AmityColorToken.SurfaceSheetsHandleDefault),
    },
    body: {
      flex: 1,
      paddingBottom: CONTENT_BOTTOM_GAP,
    },
  });

  return { styles, token };
};
