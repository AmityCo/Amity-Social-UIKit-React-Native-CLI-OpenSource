import React, { FC, memo, useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AmityEventStatus } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import EventListItems from '../../../component/Events/EventListItems';
import EventListSkeleton from '../../../component/Events/EventListSkeleton';
import { Typography } from '../../../../core/components/Typography/Typography';
import { EVENTS_STRINGS } from '../constants';
import { useEventsCollection } from '../hooks/useEventsCollection';
import { useAmityComponent } from '../../../hooks';
import { ComponentID, PageID } from '../../../enums';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import useAuth from '../../../../core/hooks/useAuth';
import type { RootStackParamList } from '../../../../core/routes/RouteParamList';

type MyEventFeedProps = {
  pageId?: PageID;
};

/**
 * Web parity: MyEvents (EventHub/components/MyEvents) — "Upcoming" and
 * "Past" sections of the current user's attended events with View all.
 */
const MyEventFeed: FC<MyEventFeedProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const { styles } = useStyles();
  const componentId = ComponentID.my_events;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });
  const { AmityMyEventFeedComponentBehaviour } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { client } = useAuth();
  const currentUserId = (client as Amity.Client)?.userId;
  const [refreshing, setRefreshing] = useState(false);

  const upcomingEventCollection = useEventsCollection({
    limit: 10,
    onlyAttendee: true,
    shouldCall: !!currentUserId,
    userId: currentUserId,
    status: AmityEventStatus.Scheduled,
  });

  const pastEventCollection = useEventsCollection({
    limit: 10,
    onlyAttendee: true,
    shouldCall: !!currentUserId,
    userId: currentUserId,
    status: AmityEventStatus.Ended,
  });

  const onPressUpcomingViewAll = useCallback(() => {
    if (AmityMyEventFeedComponentBehaviour?.goToUpcomingEventsPage) {
      return AmityMyEventFeedComponentBehaviour.goToUpcomingEventsPage({
        fromExplore: false,
      });
    }
    navigation.navigate('UpcomingEvents', { fromExplore: false });
  }, [AmityMyEventFeedComponentBehaviour, navigation]);

  const onPressPastViewAll = useCallback(() => {
    if (AmityMyEventFeedComponentBehaviour?.goToPastEventsPage) {
      return AmityMyEventFeedComponentBehaviour.goToPastEventsPage();
    }
    navigation.navigate('PastEvents');
  }, [AmityMyEventFeedComponentBehaviour, navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    upcomingEventCollection.refresh();
    pastEventCollection.refresh();
    setRefreshing(false);
  }, [upcomingEventCollection, pastEventCollection]);

  if (isExcluded) return null;

  const renderSection = (
    title: string,
    collection: typeof upcomingEventCollection,
    onPressViewAll: () => void
  ) => {
    if (collection.isLoadingFirstPage) {
      return (
        <View style={styles.skeletonSection}>
          <EventListSkeleton />
        </View>
      );
    }
    return (
      <View style={styles.section}>
        <Typography.TitleBold style={styles.sectionTitle}>
          {title}
        </Typography.TitleBold>
        <EventListItems events={collection.events.slice(0, 5)} />
        {collection.events.length >= 5 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onPressViewAll}
          >
            <Typography.BodyBold style={styles.viewAllText}>
              {EVENTS_STRINGS.VIEW_ALL}
            </Typography.BodyBold>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderSection(
        EVENTS_STRINGS.UPCOMING,
        upcomingEventCollection,
        onPressUpcomingViewAll
      )}
      {renderSection(
        EVENTS_STRINGS.PAST,
        pastEventCollection,
        onPressPastViewAll
      )}
    </ScrollView>
  );
};

export default memo(MyEventFeed);
