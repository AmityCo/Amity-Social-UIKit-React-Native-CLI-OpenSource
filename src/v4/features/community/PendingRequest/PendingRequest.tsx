import React, { useState } from 'react';
import { useStyles } from './styles';
import Header from './components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import Tabs from '~/v4/component/core/Tabs';
import PendingPostList from '~/v4/PublicApi/Components/AmityPendingPostListComponent';
import { useAmityElement } from '~/v4/hook';
import { ComponentID, ElementID, PageID } from '~/v4/enum';

type CommunityPendingRequestProps = {
  community: Amity.Community;
};

const useCommunityPendingRequest = () => {
  const { styles } = useStyles();
  const [activeTab, setActiveTab] = useState('posts');
  const [pendingPostCount, setPendingPostCount] = useState(0);
  const postsButtonTabElement = useAmityElement({
    pageId: PageID.pending_request_page,
    componentId: ComponentID.WildCardComponent,
    elementId: ElementID.posts_button_tab,
  });

  return {
    styles,
    activeTab,
    setActiveTab,
    pendingPostCount,
    setPendingPostCount,
    postsButtonTabElement,
  };
};

const CommunityPendingRequest = ({
  community,
}: CommunityPendingRequestProps) => {
  const {
    styles,
    activeTab,
    setActiveTab,
    pendingPostCount,
    setPendingPostCount,
    postsButtonTabElement,
  } = useCommunityPendingRequest();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <Tabs
        variant="underline"
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      >
        <Tabs.List>
          <Tabs.Tab
            value="posts"
            testID={postsButtonTabElement.accessibilityId}
          >
            {postsButtonTabElement.config?.text as string} (
            {pendingPostCount > 10 ? `10+` : pendingPostCount})
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Content value="posts">
          <PendingPostList
            community={community}
            onPendingPostCountChange={setPendingPostCount}
          />
        </Tabs.Content>
      </Tabs>
    </SafeAreaView>
  );
};

export default CommunityPendingRequest;
