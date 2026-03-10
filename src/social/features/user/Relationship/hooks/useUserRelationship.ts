import { useState } from 'react';
import { UserRelationshipTab } from '../../../../types';
import { useUser } from '../../../../hooks/objects';
import { useStyles } from '../styles';

type UseUserRelationship = {
  userId: string;
  selectedTab?: UserRelationshipTab;
};

export function useUserRelationship({
  userId,
  selectedTab = UserRelationshipTab.following,
}: UseUserRelationship) {
  const { styles } = useStyles();
  const { user } = useUser({ userId });
  const [activeTab, setActiveTab] = useState<UserRelationshipTab>(selectedTab);

  return {
    styles,
    activeTab,
    setActiveTab,
    displayName: user?.displayName,
  };
}
