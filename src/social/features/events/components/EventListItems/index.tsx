import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import EventCard from '../EventCard';
import EventEmptyState from '../EventEmptyState';
import EventListSkeleton from '../EventListSkeleton';

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
});

type EventListItemsProps = {
  events: Amity.Event[];
  isLoading?: boolean;
  isLoadingFirstPage?: boolean;
};

/**
 * Web parity: EventList — column of list-variant EventCards with an empty
 * state and skeleton rows. Rendered inside a parent ScrollView/FlatList, so
 * this component is intentionally non-virtualized (mirrors Web's plain grid).
 */
const EventListItems = ({
  events,
  isLoading = false,
  isLoadingFirstPage = false,
}: EventListItemsProps) => {
  return (
    <View style={styles.list}>
      {!isLoading && !isLoadingFirstPage && events.length === 0 && (
        <EventEmptyState />
      )}
      {events.map((event) => (
        <EventCard key={event.eventId} event={event} variant="list" size="md" />
      ))}
      {(isLoadingFirstPage || isLoading) && <EventListSkeleton />}
    </View>
  );
};

export default memo(EventListItems);
