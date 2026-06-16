import React, { memo, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import ContentLoader, { Circle, Rect } from 'react-content-loader/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AmityEventResponseStatus } from '@amityco/ts-sdk-react-native';
import { useTheme } from 'react-native-paper';
import { arrowLeft } from '../../../../core/assets/icons';
import { Typography } from '../../../../core/components/Typography/Typography';
import { EVENTS_STRINGS } from '../constants';
import { useRSVPCollection } from '../hooks/useRSVPCollection';
import useFile from '../../../../core/hooks/useFile';
import { defaultAvatarUri } from '../../../../core/assets';
import { useAmityPage } from '../../../hooks';
import { PageID } from '../../../enums';
import { getSkeletonBackgrounColor } from '../../../../core/utils/color';
import type { MyMD3Theme } from '../../../../core/providers/AmityUIKitProvider';
import type { RootStackParamList } from '../../../../core/routes/RouteParamList';

const AttendeeItem = memo(
  ({ rsvp, onPress }: { rsvp: Amity.EventResponse; onPress: () => void }) => {
    const theme = useTheme<MyMD3Theme>();
    const avatarUrl =
      useFile({ fileId: rsvp.user?.avatarFileId ?? '' }) ?? defaultAvatarUri;

    const styles = StyleSheet.create({
      row: {
        gap: 12,
        paddingVertical: 8,
        alignItems: 'center',
        flexDirection: 'row',
      },
      avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
      },
      name: {
        flex: 1,
        color: theme.colors.base,
      },
    });

    return (
      <TouchableOpacity style={styles.row} onPress={onPress}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <Typography.BodyBold style={styles.name} numberOfLines={1}>
          {rsvp.user?.displayName ?? rsvp.userPublicId ?? rsvp.userId}
        </Typography.BodyBold>
      </TouchableOpacity>
    );
  }
);

const AttendeesSkeleton = () => {
  const theme = useTheme<MyMD3Theme>();
  const { backgroundColor, foregroundColor } = getSkeletonBackgrounColor(theme);
  return (
    <View>
      <ContentLoader
        width={300}
        height={168}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <React.Fragment key={index}>
            <Circle cx="20" cy={28 + index * 56} r="20" />
            <Rect
              x="52"
              y={22 + index * 56}
              rx="6"
              ry="6"
              width="180"
              height="12"
            />
          </React.Fragment>
        ))}
      </ContentLoader>
    </View>
  );
};

/**
 * Web parity: EventAttendees — paginated list of "going" RSVPs with the
 * attendee's avatar and display name; rows navigate to the user profile.
 */
const AmityEventAttendeesPage = () => {
  const pageId = PageID.event_attendees_page;
  const { isExcluded, accessibilityId } = useAmityPage({ pageId });
  const theme = useTheme<MyMD3Theme>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventAttendees'>>();
  const event = route.params?.event;
  const [isScrolled, setIsScrolled] = useState(false);

  const { rsvps, isLoading, isLoadingFirstPage, hasMore, loadMore } =
    useRSVPCollection({
      event,
      status: AmityEventResponseStatus.Going,
      limit: 20,
      shouldCall: !!event,
    });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      gap: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
    },
    headerScrolled: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.baseShade4,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.base,
    },
    headerButton: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSpacer: {
      width: 24,
    },
    listContent: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  });

  if (isExcluded) return null;

  const showLoading = isLoadingFirstPage || isLoading;

  return (
    <SafeAreaView
      style={styles.container}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <View style={[styles.header, isScrolled && styles.headerScrolled]}>
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
        <Typography.TitleBold style={styles.headerTitle} numberOfLines={1}>
          {EVENTS_STRINGS.ATTENDEES}
        </Typography.TitleBold>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        data={showLoading ? [] : rsvps}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <AttendeeItem
            rsvp={item}
            onPress={() =>
              navigation.navigate('UserProfile', { userId: item.userId })
            }
          />
        )}
        ListFooterComponent={showLoading ? <AttendeesSkeleton /> : null}
        onScroll={(e) => setIsScrolled(e.nativeEvent.contentOffset.y > 0)}
        scrollEventThrottle={16}
        onEndReachedThreshold={0.7}
        onEndReached={() => {
          if (hasMore && !isLoading) loadMore();
        }}
      />
    </SafeAreaView>
  );
};

export default memo(AmityEventAttendeesPage);
