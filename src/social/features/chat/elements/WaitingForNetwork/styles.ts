// Styles for WaitingForNetwork — ported from AmityUiKitWeb
// v4/chat/elements/WaitingForNetwork.module.css. Geometry: gap 0.25rem→4.
// Colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    waitingForNetwork: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
    },
    text: {
      color: token(AmityColorToken.TextListTextDescriptionDefaultDefault),
    },
  });

  return { styles, token };
};
