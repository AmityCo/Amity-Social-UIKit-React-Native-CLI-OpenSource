// Styles for MessageReactorListSheet — ported from AmityUiKitWeb
// v4/chat/features/shared/components/MessageReactorListSheet/MessageReactorListSheet.module.css.
// The web drawer-specific bits (margin 0 -1rem, 90vh min/max-height, desktop
// 30rem width, vaul drag) are omitted: in RN the @devvie/bottom-sheet host owns
// height/width/drag, so this renders as flex content inside it. Tab-bar visuals
// reuse the SoT underlined-tab tokens/geometry (the RN Tab atom can't host an
// icon+count node label, so the bar is rendered inline — see component note).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .messageReactorListSheet
    // NOTE: no `flex: 1` here. The @devvie sheet wraps our content in an
    // AUTO-height inner View, so there is no free space for a flex child to grow
    // into — and in RN `flex: 1` means `flexBasis: 0`, which would then collapse
    // the container to height 0 (tabs overflow-paint, list vanishes). The
    // component instead sets an EXPLICIT `height` (contentHeight) from the sheet
    // height; `containerFill` is only a fallback when that height is unknown.
    container: {
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    containerFill: {
      flex: 1,
    },
    // Once the container has a definite height, the FlatList CAN flex to fill the
    // space below the fixed-height tab bar (there is now free space to grow into).
    flatList: {
      flex: 1,
    },
    // Underlined tab strip: row, gap 20, no vertical padding of its own.
    //
    // A 1px baseline rule runs under the whole strip, on the same divider token
    // every other hairline in chat uses — the two headers and the composer's top
    // border. The Tab atom carries only the per-tab 2px ACTIVE indicator, so
    // building this bar inline from it dropped the section separator entirely.
    tabList: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: token(AmityColorToken.LineDividerPostDefault),
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
    // Name + brand badge sit on one line (PDT-5165); the name shrinks, the badge
    // does not.
    rowTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      maxWidth: '100%',
    },
    // .messageReactorListSheet__rowTitle
    rowTitle: {
      flexShrink: 1,
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
