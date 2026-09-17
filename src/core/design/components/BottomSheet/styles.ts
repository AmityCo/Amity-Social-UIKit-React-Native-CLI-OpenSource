// Styles for BottomSheet. Geometry matches the sheets already in the app: a
// 12-radius top, a 36x4 handle in a 25-high strip, and the bottom safe-area
// inset on the sheet itself, since a bottom sheet's lower edge sits on the
// screen edge (home indicator / gesture bar).

import { StyleSheet } from 'react-native';

import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// The strip is the sheet's drag target, so it is sized for a finger rather than
// for the 4-tall pill drawn in the middle of it. It owns no buttons, which is
// what lets a drag started here reach the sheet at all.
const HANDLE_STRIP_HEIGHT = 48;
const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;
const SHEET_RADIUS = 12;
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
      // No `overflow: 'hidden'` here: on iOS that clips the sheet's own shadow.
      // The body below carries the clip instead.
      overflow: 'visible',
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
      backgroundColor: token(AmityColorToken.LineDividerPostDefault),
    },
    body: {
      flex: 1,
      // Keeps arbitrary sheet content inside the rounded top corners. It
      // carries no shadow, so clipping here costs nothing.
      overflow: 'hidden',
    },
  });

  return { styles, token };
};
