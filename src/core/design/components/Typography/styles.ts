import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

// Metrics from SoT tokens/geometry.json → typography.styles (Web column):
//   Headline     20 / 24 / 700
//   Title Bold   16 / 24 / 600
//   Title        16 / 24 / 400
//   Body Bold    14 / 20 / 600
//   Body         14 / 20 / 400
//   Caption Bold 12 / 16 / 600
//   Caption      12 / 16 / 400
//   Caption Small 12 / 12 / 400
// (fontSize / lineHeight / fontWeight). Web CSS sets no letter-spacing, so none here.
export const useStyles = () => {
  const token = useToken();
  const color = token(AmityColorToken.TextBaseDefault);

  const styles = StyleSheet.create({
    headline: { color, fontSize: 20, lineHeight: 24, fontWeight: '700' },
    titleBold: { color, fontSize: 16, lineHeight: 24, fontWeight: '600' },
    title: { color, fontSize: 16, lineHeight: 24, fontWeight: '400' },
    bodyBold: { color, fontSize: 14, lineHeight: 20, fontWeight: '600' },
    body: { color, fontSize: 14, lineHeight: 20, fontWeight: '400' },
    captionBold: { color, fontSize: 12, lineHeight: 16, fontWeight: '600' },
    caption: { color, fontSize: 12, lineHeight: 16, fontWeight: '400' },
    captionSmall: { color, fontSize: 12, lineHeight: 12, fontWeight: '400' },
  });

  return { styles };
};
