// Styles for SearchChannel — ported from AmityUiKitWeb SearchChannel.module.css.
// searchChannel: column, min-height 100svh → flex:1, page-background surface.
// The web tabList `position: sticky` is inherent to the non-scrolling RN layout;
// `panel` fills the remaining space so the active list can scroll within it.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    searchChannel: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    panel: {
      flex: 1,
    },
  });

  return { styles, token };
};
