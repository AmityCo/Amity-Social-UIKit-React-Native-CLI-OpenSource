// Styles for AmityMessageComposer — ported from AmityUiKitWeb
// MessageComposer.module.css. Geometry: inputRow gap 0.75rem→12, padding
// 0.5rem 1rem→8/16, min-height 3.5rem→56; icon buttons 2rem→32 round. The boxed
// input surface now lives in the shared TextEditor. Edit panel + mention overlay
// are RN additions. All colours resolve through design tokens (no hardcoded hex).

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
      alignItems: 'flex-end',
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
      marginBottom: 4,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled
      ),
    },
    sendButton: {
      width: 32,
      height: 32,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryDisabled
      ),
    },
    sendButtonEnabled: {
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledPrimaryEnabled
      ),
    },
    // --- Edit panel ----------------------------------------------------------
    editPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: token(AmityColorToken.LineDividerPostDefault),
    },
    editPanelInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    editPanelLabel: {
      color: token(AmityColorToken.TextBaseSubdue),
    },
    editPanelClose: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // --- Mention suggestion overlay -----------------------------------------
    mentionOverlay: {
      marginHorizontal: 16,
      marginBottom: 8,
      maxHeight: 180,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: token(AmityColorToken.LineDividerContentDefault),
      backgroundColor: token(AmityColorToken.SurfacePopoverBackgroundDefault),
    },
    mentionItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    mentionItemText: {
      fontSize: 14,
      lineHeight: 20,
      color: token(AmityColorToken.TextBaseDefault),
    },
  });

  const placeholderColor = token(
    AmityColorToken.TextInputTextInputPlaceholderEnabled
  );

  return { styles, token, placeholderColor };
};
