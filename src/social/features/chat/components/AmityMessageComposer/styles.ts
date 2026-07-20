// Styles for AmityMessageComposer — ported from AmityUiKitWeb MessageComposer.module.css.
// Geometry: inputRow gap 0.75rem→12, padding 0.5rem 1rem→8/16, min-height 3.5rem→56;
// icon buttons 2rem→32 round; input wrapper radius 1.25rem→20, padding 0.625rem 0.75rem
// →10/12, min-height 2.5rem→40, max-height 7.5rem→120; editor font 1rem/1.25rem→16/20.
// All colours resolve through design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
      borderTopWidth: 1,
      borderTopColor: token(AmityColorToken.LineDividerPostDefault),
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
      minHeight: 56,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled
      ),
    },
    inputWrapper: {
      flex: 1,
      minWidth: 0,
      backgroundColor: token(AmityColorToken.SurfaceInputBoxedInputDefault),
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 12,
      minHeight: 40,
      maxHeight: 120,
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      fontSize: 16,
      lineHeight: 20,
      padding: 0,
      color: token(AmityColorToken.TextInputTextInputPlaceholderEnabledFilled),
    },
    sendButton: {
      width: 32,
      height: 32,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryDisabled
      ),
    },
    sendButtonEnabled: {
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledPrimaryEnabled
      ),
    },
  });

  const placeholderColor = token(
    AmityColorToken.TextInputTextInputPlaceholderEnabled
  );

  return { styles, token, placeholderColor };
};
