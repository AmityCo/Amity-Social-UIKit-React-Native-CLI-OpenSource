// Styles for MessageReplyBand — ported from MessageReplyBand.module.css.
// The band is a Banner, not a list row — full width at 62 under the thread — so
// it takes the Banner surface and the matching Banner text colours. It had been
// asking for the List hover ones instead. Those resolve to the same hexes today,
// which is why nothing looked wrong, but they tie a banner that is simply there
// to the colour a list row wears while a finger is on it: two things that have
// no reason to move together, and that a palette is free to separate.
// Geometry: gap 0.75rem→12; height 3.875rem→62; padding 0.625/0.75/0.625/1rem→
// 10 top-bottom, left 16, right 12; text gap 0.125rem→2; thumb 2rem→32,
// radius 0.25rem→4; close 1.25rem→20; close icon 1rem→16.
// The video affordance is a 2rem thumb with a centred 1.5rem chip on the
// transparent-iconbutton surface and a 1rem glyph — not a full-cover scrim,
// for which no token exists.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    band: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      height: 62,
      paddingVertical: 10,
      paddingLeft: 16,
      paddingRight: 12,
      backgroundColor: token(AmityColorToken.SurfaceBannerSubdueGeneral),
    },
    textCol: {
      flex: 1,
      gap: 2,
    },
    title: {
      color: token(AmityColorToken.TextBannerSubdueOverlineGeneral),
    },
    body: {
      color: token(AmityColorToken.TextBannerSubdueTextDescriptionGeneral),
    },
    thumbWrap: {
      width: 32,
      height: 32,
      borderRadius: 4,
      overflow: 'hidden',
    },
    thumbImg: {
      width: 32,
      height: 32,
    },
    playChip: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playChipInner: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonTransparentPrimaryEnabled
      ),
    },
    close: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return { styles, token };
};
