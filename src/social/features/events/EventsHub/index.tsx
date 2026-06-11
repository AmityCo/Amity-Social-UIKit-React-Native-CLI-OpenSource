import { FC, memo, useState } from 'react';
import { View } from 'react-native';
import { useStyles } from './styles';
import ExploreEventFeed from './ExploreEventFeed';
import MyEventFeed from './MyEventFeed';
import Tabs from '../../../../core/components/Tabs';
import { EVENTS_STRINGS } from '../constants';
import { PageID } from '../../../enums';
import useAuth from '../../../../core/hooks/useAuth';

type AmityEventsComponentProps = {
  pageId?: PageID;
};

/**
 * Web parity: Events hub (EventHub/Events.tsx). Visitors see the Explore
 * feed only; signed-in users get underlined Explore / My event tabs. The
 * desktop-only headline header is hidden on mobile, matching Web's
 * `width < 48em` breakpoint behaviour.
 */
const AmityEventsComponent: FC<AmityEventsComponentProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const { styles } = useStyles();
  const { isVisitorOrBot } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(
    EVENTS_STRINGS.TAB_EXPLORE
  );

  if (isVisitorOrBot) {
    return (
      <View style={styles.container}>
        <ExploreEventFeed pageId={pageId} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs
        variant="underline"
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      >
        <Tabs.List style={styles.tabList}>
          <Tabs.Tab value={EVENTS_STRINGS.TAB_EXPLORE}>
            {EVENTS_STRINGS.TAB_EXPLORE}
          </Tabs.Tab>
          <Tabs.Tab value={EVENTS_STRINGS.TAB_MY_EVENTS}>
            {EVENTS_STRINGS.TAB_MY_EVENTS}
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Content value={EVENTS_STRINGS.TAB_EXPLORE}>
          <ExploreEventFeed pageId={pageId} />
        </Tabs.Content>
        <Tabs.Content value={EVENTS_STRINGS.TAB_MY_EVENTS}>
          <MyEventFeed pageId={pageId} />
        </Tabs.Content>
      </Tabs>
    </View>
  );
};

export default memo(AmityEventsComponent);
