import React, { memo } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AmityEventStatus } from '@amityco/ts-sdk-react-native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import EventCard from '../EventCard';
import { Typography } from '../../Typography/Typography';
import { EVENTS_STRINGS } from '../../constants';
import { useEventsCollection } from '../../hooks/useEventsCollection';
import { getSkeletonBackgrounColor } from '../../../../../core/utils/color';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';

/**
 * Web parity: HappeningEvents — "Happening now" carousel of live events.
 * Hidden entirely when there are no live events; one full-width lg card when
 * a single event is live, horizontally scrollable md cards otherwise.
 */
const HappeningEvents = () => {
  const theme = useTheme<MyMD3Theme>();
  const { width: windowWidth } = useWindowDimensions();
  const { events, isLoading, isLoadingFirstPage, hasMore, loadMore } =
    useEventsCollection({
      limit: 20,
      status: AmityEventStatus.Live,
    });

  const styles = StyleSheet.create({
    container: {
      gap: 16,
      paddingVertical: 16,
      backgroundColor: theme.colors.background,
    },
    title: {
      paddingHorizontal: 16,
      color: theme.colors.base,
    },
    singleItem: {
      paddingHorizontal: 16,
    },
    carouselContent: {
      gap: 12,
      paddingHorizontal: 16,
    },
    skeletonContainer: {
      padding: 16,
      backgroundColor: theme.colors.background,
    },
  });

  if (isLoadingFirstPage) {
    const { backgroundColor, foregroundColor } =
      getSkeletonBackgrounColor(theme);
    const width = windowWidth - 32;
    return (
      <View style={styles.skeletonContainer}>
        <ContentLoader
          width={width}
          height={384}
          viewBox={`0 0 ${width} 384`}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
        >
          <Rect x="0" y="0" rx="6" ry="6" width="120" height="12" />
          <Rect x="0" y="28" rx="8" ry="8" width={width} height="290" />
          <Rect x="0" y="334" rx="6" ry="6" width="120" height="12" />
          <Rect x="0" y="354" rx="6" ry="6" width="248" height="12" />
          <Rect x="0" y="374" rx="6" ry="6" width="100" height="10" />
        </ContentLoader>
      </View>
    );
  }

  if (!events || events.length === 0) return null;

  return (
    <View style={styles.container}>
      <Typography.TitleBold style={styles.title}>
        {EVENTS_STRINGS.HAPPENING_NOW}
      </Typography.TitleBold>
      {events.length === 1 ? (
        <View style={styles.singleItem}>
          <EventCard event={events[0]} variant="card" size="lg" />
        </View>
      ) : (
        <FlatList
          horizontal
          data={events}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          keyExtractor={(item) => item.eventId}
          renderItem={({ item }) => (
            <EventCard event={item} variant="card" size="md" />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore && !isLoading) loadMore();
          }}
        />
      )}
    </View>
  );
};

export default memo(HappeningEvents);
