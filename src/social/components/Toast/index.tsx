import { useStyles } from './styles';
import { Animated } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { memo, useEffect, useRef } from 'react';
import { Typography } from '../../../core/components/Typography/Typography';
import { informative, failed, success } from '../../../core/assets/icons';
import { CircularProgressIndicator } from '../CircularProgressIndicator';
import { AmityIcon } from '../../../core/design/icons';

const Toast = () => {
  const { hideToast, toast } = useToast();
  const { styles, theme, iconColor } = useStyles(
    toast.bottomPosition,
    toast.variant
  );
  const isCustom = toast.variant === 'custom';
  const timeoutRef = useRef<number | null>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.visible) {
      // For the custom (chat) loading toast, `duration` is an upper bound (web uses
      // 60s) that the caller cancels early via `hideToast` on load-complete — so the
      // fade must stay prompt (500ms) rather than track `duration`, otherwise a 60s
      // fade renders the spinner invisible. The default-variant loading toast (poll)
      // keeps its original duration-tracked fade.
      const fadeDuration =
        toast.type === 'loading' && toast.variant !== 'custom'
          ? toast.duration
          : 500;
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: false,
      }).start(() => {
        timeoutRef.current = setTimeout(() => {
          Animated.timing(fadeIn, {
            toValue: 0,
            duration: fadeDuration,
            useNativeDriver: false,
          }).start(hideToast);
        }, toast.duration);
      });
    }

    return () => {
      fadeIn.setValue(0);
      fadeIn.stopAnimation();
      clearTimeout(timeoutRef.current);
    };
  }, [fadeIn, hideToast, toast]);

  if (!toast.visible) return null;

  return (
    <Animated.View style={styles.toast}>
      {toast.type === 'loading' && (
        <CircularProgressIndicator
          size={24}
          strokeWidth={2.3}
          progressColor={theme.colors.primary}
          backgroundColor={theme.colors.background}
        />
      )}
      {toast.type === 'success' &&
        (isCustom ? (
          <AmityIcon name="check-circle-s" size={24} color={iconColor} />
        ) : (
          <SvgXml
            xml={success()}
            width="24"
            height="24"
            color={theme.colors.background}
          />
        ))}
      {toast.type === 'failed' &&
        (isCustom ? (
          // Web chat toast (Toast atom, variant 'error'): ExclamationCircle tinted
          // with --asc-color-icon-customtoast-default. Custom variant must show it —
          // previously custom failed toasts had NO icon (web/RN parity gap).
          <AmityIcon name="exclamation-circle-r" size={24} color={iconColor} />
        ) : (
          <SvgXml
            width="24"
            height="24"
            xml={failed()}
            color={theme.colors.background}
          />
        ))}
      {toast.type === 'informative' &&
        (isCustom ? (
          // Web chat toast (Toast atom, variant 'informative'): InfoCircle tinted
          // with --asc-color-icon-customtoast-default.
          <AmityIcon name="info-circle-r" size={24} color={iconColor} />
        ) : (
          <SvgXml
            width="24"
            height="24"
            xml={informative()}
            color={theme.colors.background}
          />
        ))}
      <Typography.Body style={styles.message}>{toast.message}</Typography.Body>
    </Animated.View>
  );
};

export default memo(Toast);
