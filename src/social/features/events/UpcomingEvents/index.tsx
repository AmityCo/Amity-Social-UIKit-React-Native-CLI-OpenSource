import React, { memo, useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { AmityEventStatus } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import Tabs from '../../../../core/components/Tabs';
import EventCard from '../../../component/Events/EventCard';
import EventEmptyState from '../../../component/Events/EventEmptyState';
import EventListSkeleton from '../../../component/Events/EventListSkeleton';
import { Typography } from '../../../../core/components/Typography/Typography';
import { arrowLeft } from '../../../../core/assets/icons';
import { EVENTS_STRINGS } from '../constants';
import { useEventsCollection } from '../hooks/useEventsCollection';
import { useEventPermission } from '../hooks/useEventPermission';
import { useAmityPage } from '../../../hooks';
import { PageID } from '../../../enums';
import useAuth from '../../../../core/hooks/useAuth';
import type { RootStackParamList } from '../../../../core/routes/RouteParamList';

enum UpcomingEventsTab {
  All = 'All',
  Hosting = 'Hosting',
}

/**
 * Web parity: UpcomingEvents — "Upcoming events" page. From Explore the All
 * tab lists every scheduled event; otherwise it lists the viewer's attended
 * events. The All/Hosting tabs only show for users with create-event
 * permission (never for visitors).
 */
const AmityUpcomingEventsPage = () => {
  const pageId = PageID.upcoming_events_page;
  const { isExcluded, accessibilityId } = useAmityPage({ pageId });
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'UpcomingEvents'>>();
  const fromExplore = route.params?.fromExplore ?? false;

  const { client, isVisitorOrBot } = useAuth();
  const { hasCreateEventPermission } = useEventPermission();
  const currentUserId = (client as Amity.Client)?.userId;
  const [activeTab, setActiveTab] = useState<string>(UpcomingEventsTab.All);
  const [refreshing, setRefreshing] = useState(false);

  const isAllTab = activeTab === UpcomingEventsTab.All;
  const eventCollection = useEventsCollection({
    limit: 10,
    shouldCall: !!currentUserId,
    status: AmityEventStatus.Scheduled,
    userId: fromExplore && isAllTab ? undefined : currentUserId,
    onlyAttendee: fromExplore && isAllTab ? undefined : isAllTab,
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
          {EVENTS_STRINGS.UPCOMING_EVENTS}
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
            <Tabs.Tab value={UpcomingEventsTab.All}>
              {EVENTS_STRINGS.TAB_ALL}
            </Tabs.Tab>
            <Tabs.Tab value={UpcomingEventsTab.Hosting}>
              {EVENTS_STRINGS.TAB_HOSTING}
            </Tabs.Tab>
          </Tabs.List>
          {renderEventList()}
        </Tabs>
      )}
    </SafeAreaView>
  );
};

export default memo(AmityUpcomingEventsPage);
