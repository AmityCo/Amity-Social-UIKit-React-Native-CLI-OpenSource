import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useStyles } from '../styles';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { useBehaviour } from '../../../../providers/BehaviourProvider';
import {
  VISITOR_USAGE_LIMIT_MESSAGE,
  VISITOR_TOAST_DURATION,
} from '../../../../../core/constants';

export const useUsageLimit = () => {
  const { styles, theme } = useStyles();
  const { showToast } = useToast();
  const { AmityGlobalBehaviour } = useBehaviour();

  const showSignInToast = useCallback(() => {
    showToast({
      message: VISITOR_USAGE_LIMIT_MESSAGE.TOAST,
      type: 'informative',
      duration: VISITOR_TOAST_DURATION,
    });
  }, []);

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

  const onPressSignIn = useCallback(() => {
    if (AmityGlobalBehaviour?.handleVisitorUsageLimitSignIn) {
      return AmityGlobalBehaviour.handleVisitorUsageLimitSignIn();
    }
    showSignInToast();
  }, [AmityGlobalBehaviour, showSignInToast]);

  return { styles, theme, onPressSignIn };
};
