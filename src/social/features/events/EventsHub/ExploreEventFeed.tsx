import { FC, memo, useCallback, useState } from 'react';
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
import EventListItems from '../components/EventListItems';
import HappeningEvents from '../components/HappeningEvents';
import EventListSkeleton from '../components/EventListSkeleton';
import { Typography } from '../../../../core/components/Typography/Typography';
import { EVENTS_STRINGS } from '../constants';
import { useEventsCollection } from '../hooks/useEventsCollection';
import { useAmityComponent } from '../../../hooks';
import { ComponentID, PageID } from '../../../enums';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import type { RootStackParamList } from '../../../../core/routes/RouteParamList';

type ExploreEventFeedProps = {
  pageId?: PageID;
};

/**
 * Web parity: ExploreEvent (EventHub/components/Explore) — Happening now
 * carousel + "Recommended for you" (first 5 scheduled events) + View all.
 */
const ExploreEventFeed: FC<ExploreEventFeedProps> = ({
  pageId = PageID.WildCardPage,
}) => {
  const { styles } = useStyles();
  const componentId = ComponentID.explore_event;
  const { isExcluded, accessibilityId } = useAmityComponent({
    pageId,
    componentId,
  });
  const { AmityExploreEventFeedComponentBehaviour } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const eventCollection = useEventsCollection({
    limit: 10,
    status: AmityEventStatus.Scheduled,
  });

  const onPressViewAll = useCallback(() => {
    if (AmityExploreEventFeedComponentBehaviour?.goToUpcomingEventsPage) {
      return AmityExploreEventFeedComponentBehaviour.goToUpcomingEventsPage({
        fromExplore: true,
      });
    }
    navigation.navigate('UpcomingEvents', { fromExplore: true });
  }, [AmityExploreEventFeedComponentBehaviour, navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    eventCollection.refresh();
    setRefreshing(false);
  }, [eventCollection]);

  if (isExcluded) return null;

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
      <HappeningEvents />
      {eventCollection.isLoadingFirstPage ? (
        <View style={styles.skeletonSection}>
          <EventListSkeleton />
        </View>
      ) : (
        <View style={styles.section}>
          <Typography.TitleBold style={styles.sectionTitle}>
            {EVENTS_STRINGS.RECOMMENDED_FOR_YOU}
          </Typography.TitleBold>
          <EventListItems events={eventCollection.events.slice(0, 5)} />
          {eventCollection.events.length >= 5 && (
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
      )}
    </ScrollView>
  );
};

export default memo(ExploreEventFeed);
