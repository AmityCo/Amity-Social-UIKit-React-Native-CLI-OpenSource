// Styles for MessageFullTextScreen — ported from MessageFullTextScreen.module.css.
// Web is a fixed full-viewport overlay; RN uses a full-screen Modal. Geometry:
// header padding 1rem→16, gap 0.5rem→8; back button / spacer 2rem→32; body
// padding 1rem→16. Body text is raw CSS in web (17px/24px) — replicated via the
// Typography `style` override. Web `Surface/Sheets/Background/Default` maps to the
// RN token `Surface/Sheets/Background/General`.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 16,
      backgroundColor: token(AmityColorToken.SurfaceSheetsBackgroundGeneral),
    },
    backButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: token(AmityColorToken.TextSheetsHeaderTitleDefault),
    },
    headerSpacer: {
      width: 32,
      height: 32,
    },
    body: {
      flex: 1,
      padding: 16,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    text: {
      fontSize: 17,
      lineHeight: 24,
      color: token(AmityColorToken.TextChatBubbleInboundMessagesDefault),
    },
    link: {
      color: token(AmityColorToken.TextChatBubbleInboundLinkDefault),
      textDecorationLine: 'underline',
    },
  });

  return { styles, token };
};
