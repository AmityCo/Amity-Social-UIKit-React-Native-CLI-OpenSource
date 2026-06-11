import { ReactNode, createContext, useContext, useMemo } from 'react';
import { IBehaviour } from '../../core/types/behaviour';

const BehaviourContext = createContext<IBehaviour>(undefined);

interface IBehavioudProviderProps {
  children: ReactNode;
  behaviour: IBehaviour;
}

export const BehaviourProvider = ({
  children,
  behaviour,
}: IBehavioudProviderProps) => {
  const defaultBehaviour = useMemo(
    () => ({
      AmityGlobalBehaviour: {},
      AmitySocialHomePageBehaviour: {},
      AmityGlobalFeedComponentBehavior: {},
      AmityPostContentComponentBehavior: {},
      AmitySocialHomeTopNavigationComponentBehaviour: {},
      AmityCommunitySearchResultComponent: {},
      AmityEmptyNewsFeedComponent: {},
      AmityMyCommunitiesComponentBehaviour: {},
      AmityCreatePostMenuComponentBehavior: {},
      AmityPostTargetSelectionPageBehavior: {},
      AmityStoryTargetSelectionPageBehavior: {},
      AmityLivestreamPostTargetSelectionPageBehavior: {},
      AmityCommunityProfilePageBehavior: {},
      AmityPollTargetSelectionPageBehavior: {},
      AmityCommunitySetupPageBehavior: {},
      AmityCommunitySettingPageBehavior: {},
      AmityCommunityMembershipPageBehavior: {},
      AmityCommunityNotificationSettingPageBehavior: {},
      AmityPostComposerPageBehavior: {},
      AmityUserProfilePageBehavior: {},
      AmityBlockedUsersPageBehavior: {},
      AmityUserRelationshipPageBehavior: {},
      AmityUserProfileHeaderComponentBehavior: {},
      AmityUserPendingFollowRequestsPageBehavior: {},
      AmityUserFeedComponentBehavior: {},
    }),
    []
  );

  const customBehaviour = useMemo(
    () => ({
      ...defaultBehaviour,
      ...behaviour,
    }),
    [behaviour, defaultBehaviour]
  );

  return (
    <BehaviourContext.Provider value={customBehaviour}>
      {children}
    </BehaviourContext.Provider>
  );
};

export const useBehaviour = () => {
  const context = useContext(BehaviourContext);
  if (!context) {
    throw new Error('useBehaviour must be used within a BehaviourProvider');
  }
  return context;
};
