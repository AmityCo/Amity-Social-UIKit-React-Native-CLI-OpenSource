import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './components/Header';
import { Tab, useMembership } from './hooks/useMembership';
import { useStyles } from './styles';
import Tabs from '~/v4/component/core/Tabs';
import MemberList from './components/MemberList';
import ModeratorList from './components/ModeratorList';
import { checkEditCommunityPermission } from '~/v4/utils/permissions';

type CommunityMembershipProps = {
  community: Amity.Community;
};

const CommunityMembership = ({ community }: CommunityMembershipProps) => {
  const { styles } = useStyles();
  const { onAddMember, activeTab, setActiveTab } = useMembership({ community });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        onAddMember={
          checkEditCommunityPermission(community.communityId)
            ? onAddMember
            : undefined
        }
      />
      <Tabs<Tab>
        variant="underline"
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      >
        <Tabs.List>
          <Tabs.Tab<Tab> value="members" type="body">
            Members
          </Tabs.Tab>
          <Tabs.Tab<Tab> value="moderators" type="body">
            Moderators
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Content<Tab> value="members">
          <MemberList community={community} />
        </Tabs.Content>
        <Tabs.Content<Tab> value="moderators">
          <ModeratorList community={community} />
        </Tabs.Content>
      </Tabs>
    </SafeAreaView>
  );
};

export default CommunityMembership;
