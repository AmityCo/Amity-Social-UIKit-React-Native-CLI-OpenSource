// Styles for TopBar — ported from AmityUiKitWeb v4/chat/elements/TopBar.module.css.
// Geometry: gap 0.5rem→8, padding 0.75rem 1rem→12/16, height 3.5rem→56,
// title max-width 16rem→256. Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      height: 56,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    leftAction: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    rightAction: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: 0,
    },
    title: {
      flexShrink: 0,
      maxWidth: 256,
      textAlign: 'center',
      color: token(AmityColorToken.TextSheetsHeaderTitleDefault),
    },
    iconButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return { styles, token };
};
