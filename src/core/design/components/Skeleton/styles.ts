import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

// Skeleton fill = Surface/SkeletonEffect/Default
// (web var(--asc-color-surface-skeletoneffect-default)).
export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    skeleton: {
      backgroundColor: token(AmityColorToken.SurfaceSkeletonEffectDefault),
    },
  });

  return { styles };
};
