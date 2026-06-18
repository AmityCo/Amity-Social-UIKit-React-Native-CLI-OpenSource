import { useCallback } from 'react';
import { useBehaviour } from '../providers/BehaviourProvider';
import { useToast } from '../../core/stores/slices/toastSlice';
import { useGlobalBehavior } from './useGlobalBehavior';
import {
  NON_MEMBER_ACTION_TOAST,
  VISITOR_TOAST_DURATION,
} from '../../core/constants';

type HandleInteractionParams = {
  defaultBehavior?: () => void;
  allowNonMember?: boolean;
  isJoined?: boolean;
};

export const useInteractionBehavior = () => {
  const { showToast } = useToast();
  const { AmityGlobalBehaviour } = useBehaviour();
  const { handleGlobalBehavior, isVisitorOrBot } = useGlobalBehavior();

  const handleInteraction = useCallback(
    ({
      defaultBehavior,
      allowNonMember,
      isJoined,
    }: HandleInteractionParams) => {
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

  return { handleInteraction, isVisitorOrBot };
};
