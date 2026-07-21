// Styles for MemberGrid — ported from AmityUiKitWeb
// v4/chat/features/group/create/components/MemberGrid/MemberGrid.module.css.
// Geometry: horizontal padding 1rem→16; heading padding 1.5rem 0 0.25rem→24/0/4;
// list vertical padding 1rem→16, row gap 1rem→16. Web's 4-column CSS grid with
// space-between → a wrapping flex row with space-between. Colours via tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';

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
      justifyContent: 'space-between',
      rowGap: 16,
      paddingVertical: 16,
    },
  });

  return { styles, token };
};
