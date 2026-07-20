// Styles for MessageLinkPreview — ported from MessageLinkPreview.module.css.
// Geometry: root radius 0.625rem→10; thumbnail 6rem→96 square; info padding
// 0.5rem/0.625rem→8/10, gap 0.125rem→2 (loading 0.5rem→8); broken icon 1.125rem→18.
// Title raw CSS 13/18, domain raw CSS 10/13 — replicated via Typography `style`.
// The web `data-side` selectors resolve to identical colours, so side has no
// visual effect in RN.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'stretch',
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
    },
    thumbnail: {
      width: 96,
      height: 96,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    thumbnailLoading: {
      backgroundColor: token(AmityColorToken.SurfaceMediaImageLoading),
    },
    thumbnailBroken: {
      backgroundColor: token(AmityColorToken.SurfaceMediaImageBroken),
    },
    thumbnailImg: {
      width: 96,
      height: 96,
    },
    info: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 8,
      paddingHorizontal: 10,
      justifyContent: 'center',
      gap: 2,
      backgroundColor: token(AmityColorToken.SurfaceCardPreviewLinkDefault),
    },
    infoLoading: {
      gap: 8,
      backgroundColor: token(AmityColorToken.SurfaceCardPreviewLinkSkeleton),
    },
    title: {
      fontSize: 13,
      lineHeight: 18,
      color: token(AmityColorToken.TextCardPreviewLinkTitleDefault),
    },
    domain: {
      fontSize: 10,
      lineHeight: 13,
      color: token(AmityColorToken.TextCardPreviewLinkDomainDefault),
    },
  });

  return { styles, token };
};
