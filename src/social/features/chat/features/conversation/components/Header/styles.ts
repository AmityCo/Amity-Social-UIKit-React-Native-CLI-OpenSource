// Styles for the conversation Header — ported from AmityUiKitWeb
// features/conversation/chat/components/Header/Header.module.css.
// Geometry: gap 0.5rem→8, padding 0.75rem 1rem→12/16, identity height 2.625rem→42,
// name font 0.9375rem/1.25rem→15/20 weight 700 letterSpacing -0.0256rem→-0.4.
// Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
      borderBottomWidth: 1,
      borderBottomColor: token(AmityColorToken.LineDividerPostDefault),
    },
    backButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    identity: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    name: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
      letterSpacing: -0.4,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    subtitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    subtitleText: {
      color: token(AmityColorToken.TextListTrailingSubtextDefault),
    },
  });

  return { styles, token };
};
