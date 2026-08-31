// Styles for ChatHome. The screen is a vertical stack (header, tab bar, list);
// the tab bar sits on the list surface (web `--asc-color-surface-list-default`).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    tabsWrapper: {
      backgroundColor: token(AmityColorToken.SurfaceListDefaultDefault),
    },
    listWrapper: {
      flex: 1,
    },
  });

  return { styles };
};
