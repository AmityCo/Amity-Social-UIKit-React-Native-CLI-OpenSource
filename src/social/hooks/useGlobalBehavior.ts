import { useCallback } from 'react';
import useAuth from '../../core/hooks/useAuth';
import { useBehaviour } from '../providers/BehaviourProvider';
import { useToast } from '../../core/stores/slices/toastSlice';
import { VISITOR_USER_ACTION_TOAST } from '../../core/constants';
import { setPendingVisitorJoin } from '../../core/stores/pendingVisitorJoin';

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
    ({
      defaultBehavior,
      communityId,
    }: {
      defaultBehavior?: () => void;
      /** The community being acted on, forwarded to handleVisitorUserAction
       * (e.g. so the host can auto-join it after the visitor signs in). */
      communityId?: string;
    }) => {
      if (isVisitorOrBot) {
        // Remember the community so the UIKit can auto-join it once this
        // visitor becomes signed-in (handled in AuthProvider). Recorded even
        // when a host override exists, so auto-join works regardless of the
        // host's sign-in UI.
        setPendingVisitorJoin(communityId);
        if (AmityGlobalBehavior?.handleVisitorUserAction) {
          return AmityGlobalBehavior.handleVisitorUserAction(communityId);
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
