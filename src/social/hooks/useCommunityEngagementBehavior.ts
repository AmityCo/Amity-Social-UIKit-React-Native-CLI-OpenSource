import { useCallback } from 'react';
import { useBehaviour } from '../providers/BehaviourProvider';
import { useToast } from '../../core/stores/slices/toastSlice';
import { useGlobalBehavior } from './useGlobalBehavior';
import {
  NON_MEMBER_ACTION_TOAST,
  VISITOR_TOAST_DURATION,
} from '../../core/constants';

type HandleCommunityEngagementParams = {
  defaultBehavior?: () => void;
  // Actions a non-member is still allowed to perform (e.g. viewing the
  // reaction list). When true the membership gate is skipped — only the
  // visitor gate applies.
  allowNonMember?: boolean;
  isJoined?: boolean;
};

/**
 * Engagement gate for community posts, mirroring the Web UIKit's
 * useCommunityProfileGlobalBehavior. Layers two checks on top of an action:
 *  - visitor/bot  -> visitor toast / handleVisitorUserAction (via useGlobalBehavior)
 *  - signed-in non-member (community && !isJoined) -> join toast / handleNonMemberAction
 *  - member / allowNonMember / non-community post -> run the action
 */
export const useCommunityEngagementBehavior = () => {
  const { showToast } = useToast();
  const { AmityGlobalBehaviour } = useBehaviour();
  const { handleGlobalBehavior, isVisitorOrBot } = useGlobalBehavior();

  const handleCommunityEngagement = useCallback(
    ({
      defaultBehavior,
      allowNonMember,
      isJoined,
    }: HandleCommunityEngagementParams) => {
      handleGlobalBehavior({
        defaultBehavior: () => {
          if (allowNonMember || isJoined) {
            return defaultBehavior?.();
          }
          if (AmityGlobalBehaviour?.handleNonMemberAction) {
            return AmityGlobalBehaviour.handleNonMemberAction();
          }
          return showToast({
            message: NON_MEMBER_ACTION_TOAST,
            type: 'informative',
            duration: VISITOR_TOAST_DURATION,
          });
        },
      });
    },
    [handleGlobalBehavior, AmityGlobalBehaviour, showToast]
  );

  return { handleCommunityEngagement, isVisitorOrBot };
};
