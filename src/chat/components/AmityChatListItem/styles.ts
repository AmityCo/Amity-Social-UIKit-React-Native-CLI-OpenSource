// Styles for AmityChatListItem — ported from AmityUiKitWeb ChannelItem.module.css.
// Layout geometry comes from the SoT design tokens (geometry.json → lists.listItem:
// minHeight 58, padding [8,16,8,16], gap 8, leadingElement.size 40, title 15/20,
// description 13/18); the remaining gaps mirror the web CSS (rem → px ×16).
// Every colour resolves through a design token (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

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
    // The badge opts out of nameGroup's baseline alignment: an SVG has no text
    // baseline, so RN pins its bottom edge to the name's and it sits low. Only
    // the badge is centred — the group row's "(12)" member count still shares a
    // baseline with the name, as web does.
    brandBadge: {
      alignSelf: 'center',
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
    // Skeleton row — Figma loading row `12041:242258`: 64 high, avatar circle
    // 40x40 at (16, 12) so padding is 12/16, gap 12, skeleton surface
    // background. A shorter row with tighter padding squeezes the two pills
    // together.
    skeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 64,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceListSkeletonSkeleton),
    },
    // Two stacked skeleton lines (name + preview) beside the avatar circle. The
    // design puts the second pill's top at dy 22 against a 10-high first pill,
    // so the gap is 12.
    skeletonLines: {
      flexDirection: 'column',
      gap: 12,
    },
  });

  return { styles, token };
};
