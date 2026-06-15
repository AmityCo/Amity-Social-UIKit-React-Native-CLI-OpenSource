import { useCallback } from 'react';
import useAuth from '../../core/hooks/useAuth';
import { useBehaviour } from '../providers/BehaviourProvider';
import { useToast } from '../../core/stores/slices/toastSlice';
import { VISITOR_USER_ACTION_TOAST } from '../../core/constants';

const TOAST_DURATION = 3000;

/**
 * Mirrors the Web UIKit's useGlobalBehavior: gate a restricted action behind
 * the visitor/bot check. For signed-in users the default behaviour runs; for
 * visitors the AmityGlobalBehavior.handleVisitorUserAction override is
 * called when provided, otherwise a "create an account or sign in" toast is
 * shown.
 */
export const useGlobalBehavior = () => {
  const { isVisitorOrBot } = useAuth();
  const { AmityGlobalBehavior } = useBehaviour();
  const { showToast } = useToast();

  const handleGlobalBehavior = useCallback(
    ({ defaultBehavior }: { defaultBehavior?: () => void }) => {
      if (isVisitorOrBot) {
        if (AmityGlobalBehavior?.handleVisitorUserAction) {
          return AmityGlobalBehavior.handleVisitorUserAction();
        }
        return showToast({
          message: VISITOR_USER_ACTION_TOAST,
          type: 'informative',
          duration: TOAST_DURATION,
        });
      }
      return defaultBehavior?.();
    },
    [isVisitorOrBot, AmityGlobalBehavior, showToast]
  );

  return { handleGlobalBehavior, isVisitorOrBot };
};
