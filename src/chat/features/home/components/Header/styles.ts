// Styles for Header — ported from AmityUiKitWeb Header.module.css.
// Geometry mirrors the web CSS (padding 0.75rem 1rem, gap 0.5rem → px ×16);
// colours resolve through design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

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
    },
    // Web gives the title and the actions `flex: 1 0 0` each and lets the offline
    // indicator between them take its natural width — fine on a desktop header.
    // On a phone the two halves claim everything and the indicator (flexShrink: 0)
    // overflowed under the action buttons, so RN sizes both sides to their content
    // and gives the middle slot the slack instead.
    title: {
      flexShrink: 1,
      minWidth: 0,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    /** Centres WaitingForNetwork between the title and the actions. */
    networkSlot: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // web header__actions: justify-content flex-end, gap 0.75rem→12
    actions: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    },
  });

  return { styles };
};
