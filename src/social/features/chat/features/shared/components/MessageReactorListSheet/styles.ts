// Styles for MessageReactorListSheet — ported from AmityUiKitWeb
// v4/chat/features/shared/components/MessageReactorListSheet/MessageReactorListSheet.module.css.
// The web drawer-specific bits (margin 0 -1rem, 90vh min/max-height, desktop
// 30rem width, vaul drag) are omitted: in RN the @devvie/bottom-sheet host owns
// height/width/drag, so this renders as flex content inside it. Tab-bar visuals
// reuse the SoT underlined-tab tokens/geometry (the RN Tab atom can't host an
// icon+count node label, so the bar is rendered inline — see component note).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .messageReactorListSheet
    container: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    // The reactor list must fill the remaining sheet height below the tab bar.
    // Without flex:1 the FlatList collapses to 0 height inside the bottom-sheet's
    // flex column, so its (loaded) rows never show.
    flatList: {
      flex: 1,
    },
    // .messageReactorListSheet__tabList (underlined: row, gap 20, padding 0 per web sheet)
    tabList: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      paddingHorizontal: 16,
    },
    // one underlined tab (SoT geometry: height 56, paddingTop 16, gap 14, indicator 2)
    tab: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      height: 56,
      paddingTop: 16,
      backgroundColor: 'transparent',
    },
    // .messageReactorListSheet__tabLabel
    tabLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    tabLabelText: {
      fontSize: 17,
      lineHeight: 24,
    },
    // underlined-tab label colours/weights (SoT Text/Tab/Underlined tokens)
    tabLabelTextActive: {
      fontWeight: '600',
      color: token(AmityColorToken.TextTabUnderlinedActive),
    },
    tabLabelTextDefault: {
      fontWeight: '400',
      color: token(AmityColorToken.TextTabUnderlinedDefault),
    },
    tabIndicator: {
      width: '100%',
      height: 2,
      backgroundColor: 'transparent',
    },
    tabIndicatorActive: {
      backgroundColor: token(AmityColorToken.LineTabUnderlinedActive),
    },
    // .messageReactorListSheet__list
    list: {
      flex: 1,
      paddingTop: 8,
      paddingBottom: 48,
    },
    // .messageReactorListSheet__row
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      height: 56,
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: 'transparent',
    },
    // .messageReactorListSheet__rowText
    rowText: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'flex-start',
      minWidth: 0,
    },
    // .messageReactorListSheet__rowTitle
    rowTitle: {
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    // .messageReactorListSheet__rowCaption
    rowCaption: {
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
    // .messageReactorListSheet__emptyState
    emptyState: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingTop: 48,
      paddingHorizontal: 24,
      paddingBottom: 24,
      width: '100%',
    },
    // .messageReactorListSheet__emptyStateText
    emptyStateText: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    // .messageReactorListSheet__emptyStateTitle
    emptyStateTitle: {
      color: token(AmityColorToken.TextEmptyStateTitleDefault),
    },
    // .messageReactorListSheet__emptyStateDescription
    emptyStateDescription: {
      color: token(AmityColorToken.TextEmptyStateDescriptionDefault),
    },
    // skeleton row line (web Skeleton.Line 8.75rem × 0.625rem, radius 0.75rem)
    skeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 56,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  });

  // Empty-state SmilePlus glyph colour — web `--asc-color-icon-emptystate-icon-default`.
  const emptyStateIconColor = token(AmityColorToken.IconEmptyStateIconDefault);

  return { styles, emptyStateIconColor };
};
