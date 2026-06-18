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
  allowNonMember?: boolean;
  isJoined?: boolean;
};

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
