// Styles for GroupSetting — ported from AmityUiKitWeb
// v4/chat/features/group/setting/GroupSetting.module.css.
// rem → px×16; colours via design tokens (no hardcoded hex).

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
    },
    // .groupSetting__avatarWrapper — center, 1rem vertical padding.
    avatarWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
    // .groupSetting__avatar — 7.5rem square, 1.5rem radius, clipped.
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 24,
      overflow: 'hidden',
    },
    section: {
      width: '100%',
      flexDirection: 'column',
    },
    // .groupSetting__sectionTitle — padding 1.5rem/1rem/0.25rem.
    sectionTitle: {
      paddingTop: 24,
      paddingHorizontal: 16,
      paddingBottom: 4,
      color: token(AmityColorToken.TextListHeaderDefaultDefault),
    },
    // .groupSetting__divider — hairline, inset 1rem, post-divider tint.
    divider: {
      height: 1,
      marginHorizontal: 16,
      backgroundColor: token(AmityColorToken.LineDividerPostDefault),
    },
  });

  return { styles, token };
};
