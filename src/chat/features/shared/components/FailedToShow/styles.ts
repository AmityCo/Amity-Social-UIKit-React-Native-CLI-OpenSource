// Styles for FailedToShow — ported from FailedToShow.module.css.
// Geometry: gap 0.5rem→8, padding 1.5rem→24, icon 4rem→64. `flex: 1 1 auto`
// fill → flex:1 + center. Colours via tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    failedToShow: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 24,
    },
    title: {
      textAlign: 'center',
      color: token(AmityColorToken.TextEmptyStateTitleDefault),
    },
    desc: {
      textAlign: 'center',
      color: token(AmityColorToken.TextEmptyStateDescriptionDefault),
    },
  });

  return { styles, token };
};
