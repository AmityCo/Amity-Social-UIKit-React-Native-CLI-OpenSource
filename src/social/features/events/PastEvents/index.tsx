import { memo, useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import {
  AmityEventOrderOption,
  AmityEventStatus,
} from '@amityco/ts-sdk-react-native';
import { useStyles } from '../UpcomingEvents/styles';
import Tabs from '../../../../core/components/Tabs';
import EventCard from '../components/EventCard';
import EventEmptyState from '../components/EventEmptyState';
import EventListSkeleton from '../components/EventListSkeleton';
import { Typography } from '../../../../core/components/Typography/Typography';
import { arrowLeft } from '../../../../core/assets/icons';
import { EVENTS_STRINGS } from '../constants';
import { useEventsCollection } from '../hooks/useEventsCollection';
import { useEventPermission } from '../hooks/useEventPermission';
import { useAmityPage } from '../../../hooks';
import { PageID } from '../../../enums';
import useAuth from '../../../../core/hooks/useAuth';

enum PastEventsTab {
  All = 'All',
  Hosting = 'Hosting',
}

/**
 * Web parity: PastEvents — "Past events" page listing the viewer's ended
 * events (newest first), with All/Hosting tabs for users with create-event
 * permission.
 */
const AmityPastEventsPage = () => {
  const pageId = PageID.past_events_page;
  const { isExcluded, accessibilityId } = useAmityPage({ pageId });
  const { styles, theme } = useStyles();
  const navigation = useNavigation();

  const { client, isVisitorOrBot } = useAuth();
  const { hasCreateEventPermission } = useEventPermission();
  const currentUserId = (client as Amity.Client)?.userId;
  const [activeTab, setActiveTab] = useState<string>(PastEventsTab.All);
  const [refreshing, setRefreshing] = useState(false);

  const eventCollection = useEventsCollection({
    limit: 10,
    userId: currentUserId,
    shouldCall: !!currentUserId,
    status: AmityEventStatus.Ended,
    onlyAttendee: activeTab === PastEventsTab.All,
    orderBy: AmityEventOrderOption.Descending,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    eventCollection.refresh();
    setRefreshing(false);
  }, [eventCollection]);

  if (isExcluded) return null;

  const renderEventList = () => (
    <FlatList
      data={eventCollection.events}
      style={styles.container}
      contentContainerStyle={styles.listContent}
      keyExtractor={(item) => item.eventId}
      renderItem={({ item }) => (
        <EventCard event={item} variant="list" size="md" />
      )}
      ListEmptyComponent={
        eventCollection.isLoadingFirstPage ? null : <EventEmptyState />
      }
      ListFooterComponent={
        eventCollection.isLoading ? <EventListSkeleton /> : null
      }
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (eventCollection.hasMore && !eventCollection.isLoading) {
          eventCollection.loadMore();
        }
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );

  return (
    <SafeAreaView
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <SvgXml
            xml={arrowLeft()}
            width={24}
            height={24}
            color={theme.colors.base}
          />
        </TouchableOpacity>
        <Typography.Headline style={styles.headerTitle} numberOfLines={1}>
          {EVENTS_STRINGS.PAST_EVENTS}
        </Typography.Headline>
        <View style={styles.headerSpacer} />
      </View>
      {isVisitorOrBot || !hasCreateEventPermission ? (
        renderEventList()
      ) : (
        <Tabs
          variant="underline"
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        >
          <Tabs.List style={styles.tabList}>
            <Tabs.Tab value={PastEventsTab.All}>
              {EVENTS_STRINGS.TAB_ALL}
            </Tabs.Tab>
            <Tabs.Tab value={PastEventsTab.Hosting}>
              {EVENTS_STRINGS.TAB_HOSTING}
            </Tabs.Tab>
          </Tabs.List>
          {renderEventList()}
        </Tabs>
      )}
    </SafeAreaView>
  );
};

export default memo(AmityPastEventsPage);
