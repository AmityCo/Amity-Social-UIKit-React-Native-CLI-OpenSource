// Styles for MessageReplyBand — ported from MessageReplyBand.module.css.
// Geometry: gap 0.75rem→12; height 3.875rem→62; padding 0.625/0.75/0.625/1rem→
// 10 top-bottom, left 16, right 12; text gap 0.125rem→2; thumb 2rem→32,
// radius 0.25rem→4; close 1.25rem→20; close icon 1rem→16.
// PDT-3996 (web 3bdd1f75a) revised the video affordance: the thumb shrank from
// 2.375rem→2rem, and the full-cover rgb(0 0 0/40%) scrim became a centred 1.5rem
// chip on the transparent-iconbutton surface with a 1rem glyph. The chip surface
// was already the RN choice (no scrim token exists); the sizes now match too.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

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
      backgroundColor: token(AmityColorToken.SurfaceListDefaultHover),
    },
    textCol: {
      flex: 1,
      gap: 2,
    },
    title: {
      color: token(AmityColorToken.TextListOverlineDefaultDefault),
    },
    body: {
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
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
