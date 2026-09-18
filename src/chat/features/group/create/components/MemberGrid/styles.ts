// Styles for MemberGrid — ported from AmityUiKitWeb
// v4/chat/features/group/create/components/MemberGrid/MemberGrid.module.css.
// Geometry: horizontal padding 1rem→16; heading padding 1.5rem 0 0.25rem→24/0/4;
// list vertical padding 1rem→16, row gap 1rem→16. Colours via tokens.
//
// Web's list is `grid-template-columns: repeat(4, 4rem)` — a *fixed*
// four-column track set. The RN port used a free-wrapping flex row with
// `justifyContent: 'space-between'` and no column gap, which does not behave the
// same: the 64px tiles simply pack until they run out of width (five per row on
// a 360dp Android screen, near-touching), and any partial row gets its few tiles
// flung to opposite edges. Pinning each cell to 25% of the row reproduces web's
// four columns at every width, keeps the inter-tile rhythm even, and leaves a
// partial last row left-aligned in its tracks the way grid does.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    memberGrid: {
      flexDirection: 'column',
      paddingHorizontal: 16,
    },
    heading: {
      paddingTop: 24,
      paddingBottom: 4,
      color: token(AmityColorToken.TextInputUserInputTitleDefault),
    },
    list: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 16,
      paddingVertical: 16,
    },
    // One grid track: 4 per row, each centring its fixed-width (64) tile.
    cell: {
      width: '25%',
      alignItems: 'center',
    },
  });

  return { styles, token };
};
