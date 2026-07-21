// Styles for AmityChatListItem — ported from AmityUiKitWeb ChannelItem.module.css.
// Layout geometry comes from the SoT design tokens (geometry.json → lists.listItem:
// minHeight 58, padding [8,16,8,16], gap 8, leadingElement.size 40, title 15/20,
// description 13/18); the remaining gaps mirror the web CSS (rem → px ×16).
// Every colour resolves through a design token (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // SoT lists.listItem: minHeight 58, padding [8,16,8,16], gap 8, align top.
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      minHeight: 58,
      backgroundColor: 'transparent',
    },
    containerPressed: {
      backgroundColor: token(AmityColorToken.SurfaceListDefaultHover),
    },
    // SoT leadingElement.size 40.
    avatarWrapper: {
      width: 40,
      height: 40,
    },
    body: {
      flex: 1,
      minWidth: 0,
      gap: 2, // web body gap 0.125rem
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8, // web nameRow gap 0.5rem
    },
    nameGroup: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4, // web nameGroup gap 0.25rem
      minWidth: 0,
    },
    // SoT title: size 15, lineHeight 20, weight 590 (≈'600').
    name: {
      flexShrink: 1,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    nameDeleted: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    // SoT description: size 13, lineHeight 18.
    memberCount: {
      flexShrink: 0,
      fontSize: 13,
      lineHeight: 18,
      color: token(AmityColorToken.TextListSubheadDefaultDefault),
    },
    timestamp: {
      flexShrink: 0,
      fontSize: 13,
      lineHeight: 18,
      color: token(AmityColorToken.TextListTrailingSubtextDefault),
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8, // web previewRow gap 0.5rem
    },
    preview: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      lineHeight: 18,
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
    previewMention: {
      fontWeight: '600',
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
    previewWithIcon: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4, // web previewWithIcon gap 0.25rem
      minWidth: 0,
    },
    notifications: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4, // web notifications gap 0.25rem
    },
    // Web skeleton row: height 3.5rem (SoT skeletonHeight 56), padding 8/16,
    // gap 0.75rem, skeleton surface background.
    skeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 56,
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceListSkeletonSkeleton),
    },
    // Two stacked skeleton lines (name + preview) beside the avatar circle.
    skeletonLines: {
      flexDirection: 'column',
      gap: 6,
    },
  });

  return { styles, token };
};
