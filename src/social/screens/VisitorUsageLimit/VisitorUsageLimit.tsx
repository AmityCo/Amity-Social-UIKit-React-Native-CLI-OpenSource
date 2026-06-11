import React, { useCallback, useEffect } from 'react';
import { BackHandler, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useStyles } from './styles';
import { Typography } from '../../../core/components/Typography/Typography';
import { visitorLimit } from '../../../core/assets/icons';
import { useToast } from '../../../core/stores/slices/toastSlice';
import { useBehaviour } from '../../providers/BehaviourProvider';
import { VISITOR_USAGE_LIMIT_MESSAGE } from '../../../core/constants';

const TOAST_DURATION = 3000;

export function VisitorUsageLimit() {
  const { styles, theme } = useStyles();
  const { showToast } = useToast();
  const { AmityGlobalBehaviour } = useBehaviour();

  const showSignInToast = useCallback(() => {
    showToast({
      message: VISITOR_USAGE_LIMIT_MESSAGE.TOAST,
      type: 'informative',
      duration: TOAST_DURATION,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast appears on the initial usage-limit trigger only; a dismissed
  // sign-in flow returning to this page must not re-show it.
  useEffect(() => {
    showSignInToast();
  }, [showSignInToast]);

  // Dead-end page: swallow the Android hardware back press so the user
  // cannot navigate away from the error state.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    return () => subscription.remove();
  }, []);

  const onPressSignIn = () => {
    if (AmityGlobalBehaviour?.handleVisitorUsageLimitSignIn) {
      return AmityGlobalBehaviour.handleVisitorUsageLimitSignIn();
    }
    showSignInToast();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left']}>
      <View style={styles.contentContainer}>
        <SvgXml
          width={60}
          height={40}
          style={styles.icon}
          xml={visitorLimit()}
          color={theme.colors.secondaryShade4}
        />
        <Typography.TitleBold style={styles.title}>
          {VISITOR_USAGE_LIMIT_MESSAGE.TITLE}
        </Typography.TitleBold>
        <Typography.Caption style={styles.subtitle}>
          {VISITOR_USAGE_LIMIT_MESSAGE.SUBTITLE}
        </Typography.Caption>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={onPressSignIn}
          accessibilityRole="button"
        >
          <Typography.BodyBold style={styles.signInText}>
            {VISITOR_USAGE_LIMIT_MESSAGE.SIGN_IN}
          </Typography.BodyBold>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
