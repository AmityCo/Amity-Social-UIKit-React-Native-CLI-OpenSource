import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar, FollowingList, FollowerList } from './components';
import { useUserRelationship } from './hooks/useUserRelationship';
import { RootStackParamList } from '../../../../core/routes/RouteParamList';
import Tabs from '../../../../core/components/Tabs';
import { UserRelationshipTab } from '../../../types';
import { useAmityPage } from '../../../hooks';
import { PageID } from '../../../enums';

type RelationshipProps = RootStackParamList['UserRelationship'];

export function Relationship({ userId, selectedTab }: RelationshipProps) {
  const { styles, activeTab, setActiveTab, displayName } = useUserRelationship({
    userId,
    selectedTab,
  });
  const { accessibilityId } = useAmityPage({
    pageId: PageID.user_relationship_page,
  });

  return (
    <SafeAreaView
      testID={accessibilityId}
      style={styles.container}
      edges={['top']}
    >
      <TopBar displayName={displayName} />
      <Tabs<UserRelationshipTab>
        variant="underline"
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      >
        <Tabs.List>
          <Tabs.Tab<UserRelationshipTab>
            type="title"
            value={UserRelationshipTab.following}
          >
            Following
          </Tabs.Tab>
          <Tabs.Tab<UserRelationshipTab>
            type="title"
            value={UserRelationshipTab.follower}
          >
            Followers
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Content<UserRelationshipTab>
          value={UserRelationshipTab.following}
        >
          <FollowingList userId={userId} />
        </Tabs.Content>
        <Tabs.Content<UserRelationshipTab> value={UserRelationshipTab.follower}>
          <FollowerList userId={userId} />
        </Tabs.Content>
      </Tabs>
    </SafeAreaView>
  );
}
