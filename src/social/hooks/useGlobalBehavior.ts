import { useCallback } from 'react';
import useAuth from '../../core/hooks/useAuth';
import { useBehaviour } from '../providers/BehaviourProvider';
import { useToast } from '../../core/stores/slices/toastSlice';
import {
  VISITOR_USER_ACTION_TOAST,
  VISITOR_TOAST_DURATION,
} from '../../core/constants';

export const useGlobalBehavior = () => {
  const { showToast } = useToast();
  const { isVisitorOrBot } = useAuth();
  const { AmityGlobalBehaviour } = useBehaviour();

  const handleGlobalBehavior = useCallback(
    ({ defaultBehavior }: { defaultBehavior?: () => void }) => {
      if (isVisitorOrBot) {
        if (AmityGlobalBehaviour?.handleVisitorUserAction) {
          return AmityGlobalBehaviour.handleVisitorUserAction();
        }
        return showToast({
          message: VISITOR_USER_ACTION_TOAST,
          type: 'informative',
          duration: VISITOR_TOAST_DURATION,
        });
      }
      return defaultBehavior?.();
    },
    [isVisitorOrBot, AmityGlobalBehaviour, showToast]
  );

  return { handleGlobalBehavior, isVisitorOrBot };
};
