// Styles for ContentReportReason — ported from AmityUiKitWeb
// core/design/components/ContentReportReason/ContentReportReason.module.css.
// Web is a drawer at `data-full-height` (capped at 96%); RN is a bottom sheet at 90%
// per Figma.
// Geometry: header padding 0.75rem/1rem → 12/16; description padding 12/16; list
// rows padding 1rem → 16; bottom bar padding 1rem → 16; others field padding
// 1.5rem 1rem 0 → paddingTop 24 / paddingHorizontal 16. Web token
// `text-list-textdescription-default-default` → RN `TextListTextDescriptionDefaultDefault`.

import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();
  const { bottom } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    // The sheet body itself. Matches the shared BottomSheetComponent's container:
    // sheet background + the bottom safe-area inset, since a bottom sheet's lower
    // edge sits on the screen edge (home indicator / gesture bar).
    sheet: {
      backgroundColor: token(AmityColorToken.SurfaceSheetsBackgroundGeneral),
      paddingBottom: bottom,
    },
    screen: {
      height: '100%',
      backgroundColor: token(AmityColorToken.SurfaceSheetsBackgroundGeneral),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: token(AmityColorToken.LineDividerPostDefault),
      backgroundColor: token(AmityColorToken.SurfaceSheetsBackgroundGeneral),
    },
    headerSlot: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerSlotLeft: {
      justifyContent: 'flex-start',
    },
    headerSlotCenter: {
      justifyContent: 'center',
    },
    headerSlotRight: {
      justifyContent: 'flex-end',
    },
    iconButton: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
      color: token(AmityColorToken.TextSheetsHeaderTitleDefault),
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 48,
    },
    description: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
    // Others row (a plain Pressable) — matches the padded, space-between list row.
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    // Background behind a Selection.Radio (the atom owns its own padded row layout).
    rowSurface: {
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    option: {
      flex: 1,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    othersField: {
      paddingTop: 24,
      paddingHorizontal: 16,
    },
    // The error state fills the space the header + list would have taken, so the
    // icon/title/description group sits optically centred in the sheet.
    failed: {
      flex: 1,
    },
    bottomBar: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: token(AmityColorToken.LineDividerPostDefault),
      backgroundColor: token(AmityColorToken.SurfaceSheetsBackgroundGeneral),
    },
  });

  return { styles, token };
};
