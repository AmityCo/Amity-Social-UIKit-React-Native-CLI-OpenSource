// Styles for AmityMediaAttachmentPicker — ported from AmityUiKitWeb MediaSection.module.css.
// Geometry: container padding 0.5rem 0 → vertical 8; row height 5.625rem→90, gap 3.5rem→56;
// item width 4rem→64, gap 0.25rem→4; chip padding 0.5rem→8, radius 6.1875rem→99. Hover
// states dropped (no hover on touch). Colours resolve through the design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'flex-start',
      paddingVertical: 8,
      backgroundColor: token(AmityColorToken.SurfaceSheetsBackgroundGeneral),
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 90,
      gap: 56,
    },
    item: {
      alignItems: 'center',
      width: 64,
      gap: 4,
    },
    chip: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      borderRadius: 99,
      backgroundColor: token(
        AmityColorToken.SurfaceIconButtonFilledSecondaryEnabled
      ),
    },
    label: {
      width: '100%',
      textAlign: 'center',
      color: token(AmityColorToken.TextIconButtonLabelGeneral),
    },
  });

  return { styles, token };
};
