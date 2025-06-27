import { useStyles } from './styles';
import { Animated } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useToast } from '../../stores/slices/toast';
import React, { memo, useEffect, useRef } from 'react';
import { Typography } from '../Typography/Typography';
import { informative, failed, success } from '../../assets/icons';
import { CircularProgressIndicator } from '../CircularProgressIndicator';

const Toast = () => {
  const { styles, theme } = useStyles();
  const { hideToast, toast } = useToast();
  const timeoutRef = useRef<number | null>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: toast.type === 'loading' ? toast.duration : 500,
        useNativeDriver: false,
      }).start(() => {
        timeoutRef.current = setTimeout(() => {
          Animated.timing(fadeIn, {
            toValue: 0,
            duration: toast.type === 'loading' ? toast.duration : 500,
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
      {toast.type === 'success' && (
        <SvgXml
          xml={success()}
          width="24"
          height="24"
          color={theme.colors.background}
        />
      )}
      {toast.type === 'failed' && (
        <SvgXml
          width="24"
          height="24"
          xml={failed()}
          color={theme.colors.background}
        />
      )}
      {toast.type === 'informative' && (
        <SvgXml
          width="24"
          height="24"
          xml={informative()}
          color={theme.colors.background}
        />
      )}
      <Typography.Body style={styles.message}>{toast.message}</Typography.Body>
    </Animated.View>
  );
};

export default memo(Toast);
