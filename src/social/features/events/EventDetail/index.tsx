import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useStyles } from './styles';
import EventTopBar from './Components/EventTopBar';
import EventCoverImage from './Components/EventCoverImage';
import EventDescription from './Components/EventDescription';
import EventInfo from './Components/EventInfo';
import EventDiscussion, {
  EventDiscussionRef,
} from './Components/EventDiscussion';
import RSVPButton from './Components/RSVPButton';
import IconTab from '../../../components/IconTab/IconTab';
import FloatingButton from '../../../components/legacy/FloatingButton';
import { Typography } from '../../../../core/components/Typography/Typography';
import {
  event as eventIcon,
  eventDiscussion,
  post as postIcon,
  poll as pollIcon,
  livestream as livestreamIcon,
} from '../../../../core/assets/icons';
import { EVENTS_STRINGS } from '../constants';
import { useEvent } from '../hooks/useEvent';
import { useMyRSVP } from '../hooks/useRSVP';
import { useAmityPage } from '../../../hooks';
import { PageID } from '../../../enums';
import { useBottomSheet } from '../../../../core/stores/slices/bottomSheetSlice';
import { useBehaviour } from '../../../providers/BehaviourProvider';
import useAuth from '../../../../core/hooks/useAuth';
import type { RootStackParamList } from '../../../../core/routes/RouteParamList';

enum EventDetailTab {
  About = 'about',
  Discussion = 'discussion',
}

type AmityEventDetailPageProps = {
  eventId?: string;
};

/**
 * Web parity: EventDetail — cover, description, RSVP, icon tabs
 * (About / Discussion) with sticky tab bar, floating top bar that gains the
 * cover background once scrolled, and the discussion composer FAB (members
 * only, hidden for visitors).
 */
const AmityEventDetailPage: FC<AmityEventDetailPageProps> = ({ eventId }) => {
  const pageId = PageID.event_detail_page;
  const { isExcluded, accessibilityId } = useAmityPage({ pageId });
  const { styles, theme, insets } = useStyles();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isVisitorOrBot } = useAuth();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const { AmityEventDetailPageBehaviour } = useBehaviour();
  const { width: windowWidth } = useWindowDimensions();

  const resolvedEventId = eventId ?? route.params?.eventId;
  const { event, isLoading, refresh } = useEvent({ eventId: resolvedEventId });
  const { myRSVP, setMyRSVP } = useMyRSVP({ event });

  const [activeTab, setActiveTab] = useState<EventDetailTab>(
    EventDetailTab.About
  );
  const [isBackgroundShown, setIsBackgroundShown] = useState(false);
  const [sticky, setSticky] = useState(false);
  const tabsYRef = useRef(0);
  const discussionRef = useRef<EventDiscussionRef>(null);

  const topBarHeight = insets.top + 56;
  const coverHeight = windowWidth * (9 / 16);

  // Web parity: useEventDetail refreshes the event (rsvpCount) whenever the
  // viewer's RSVP status changes.
  const myRSVPStatus = myRSVP?.status;
  useEffect(() => {
    if (myRSVPStatus) refresh();
  }, [myRSVPStatus, refresh]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const y = contentOffset.y;
      setIsBackgroundShown(y > coverHeight * 0.75);
      setSticky(tabsYRef.current > 0 && y >= tabsYRef.current - topBarHeight);
      if (
        activeTab === EventDetailTab.Discussion &&
        contentSize.height - layoutMeasurement.height - y < 400
      ) {
        discussionRef.current?.loadMore();
      }
    },
    [coverHeight, topBarHeight, activeTab]
  );

  const fabStyles = StyleSheet.create({
    menuSheet: {
      paddingHorizontal: 16,
    },
    menuRow: {
      gap: 12,
      paddingVertical: 12,
      alignItems: 'center',
      flexDirection: 'row',
    },
    menuIcon: {
      width: 32,
      height: 32,
    },
    menuLabel: {
      color: theme.colors.base,
    },
    stickyTabs: {
      top: topBarHeight,
      left: 0,
      right: 0,
      zIndex: 99,
      position: 'absolute',
    },
  });

  const onPressCreatePost = useCallback(() => {
    closeBottomSheet();
    if (!event?.discussionCommunityId) return;
    if (AmityEventDetailPageBehaviour?.goToPostComposerPage) {
      return AmityEventDetailPageBehaviour.goToPostComposerPage({
        targetId: event.discussionCommunityId,
        targetType: 'community',
        targetName: event.title,
        community: event.targetCommunity,
      });
    }
    navigation.navigate('CreatePost', {
      targetId: event.discussionCommunityId,
      targetType: 'community',
      community: event.targetCommunity,
    });
  }, [closeBottomSheet, event, AmityEventDetailPageBehaviour, navigation]);

  const onPressCreatePoll = useCallback(() => {
    closeBottomSheet();
    if (!event?.discussionCommunityId) return;
    navigation.navigate('PollPostComposer', {
      targetId: event.discussionCommunityId,
      targetType: 'community',
      targetName: event.title,
      community: event.targetCommunity,
    });
  }, [closeBottomSheet, event, navigation]);

  const onPressCreateLivestream = useCallback(() => {
    closeBottomSheet();
    if (!event?.discussionCommunityId) return;
    if (AmityEventDetailPageBehaviour?.goToCreateLivestreamPage) {
      return AmityEventDetailPageBehaviour.goToCreateLivestreamPage({
        targetId: event.discussionCommunityId,
        targetType: 'community',
      });
    }
    navigation.navigate('CreateLivestream', {
      targetId: event.discussionCommunityId,
      targetType: 'community',
      targetName: event.title,
    });
  }, [closeBottomSheet, event, AmityEventDetailPageBehaviour, navigation]);

  // Web parity: discussion composer actions — "post" / "Poll" / "Live stream"
  const onPressComposerFab = useCallback(() => {
    const actions = [
      {
        key: 'post',
        label: EVENTS_STRINGS.POST,
        icon: postIcon(),
        onPress: onPressCreatePost,
      },
      {
        key: 'poll',
        label: EVENTS_STRINGS.POLL,
        icon: pollIcon(),
        onPress: onPressCreatePoll,
      },
      {
        key: 'livestream',
        label: EVENTS_STRINGS.LIVE_STREAM,
        icon: livestreamIcon(),
        onPress: onPressCreateLivestream,
      },
    ];
    openBottomSheet({
      content: (
        <View style={fabStyles.menuSheet}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={fabStyles.menuRow}
              onPress={action.onPress}
            >
              <SvgXml
                xml={action.icon}
                width={28}
                height={28}
                color={theme.colors.base}
              />
              <Typography.BodyBold style={fabStyles.menuLabel}>
                {action.label}
              </Typography.BodyBold>
            </TouchableOpacity>
          ))}
        </View>
      ),
      height: 240,
    });
  }, [
    openBottomSheet,
    fabStyles,
    onPressCreatePost,
    onPressCreatePoll,
    onPressCreateLivestream,
  ]);

  if (isExcluded) return null;

  if (!event || event.isDeleted) {
    if (isLoading) {
      return <View style={styles.page} testID={accessibilityId} />;
    }
    // Web parity: FailedToShow fallback
    return (
      <View style={styles.fallbackContainer} testID={accessibilityId}>
        <Typography.Headline style={styles.fallbackText}>
          Something went wrong
        </Typography.Headline>
        <Typography.Body style={styles.fallbackText}>
          {"The content you're looking for is unavailable."}
        </Typography.Body>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Typography.Body style={styles.fallbackLink}>Go back</Typography.Body>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTabs = () => (
    <View style={styles.tabList}>
      <TouchableOpacity onPress={() => setActiveTab(EventDetailTab.About)}>
        <IconTab
          isActive={activeTab === EventDetailTab.About}
          themeStyles={theme}
          icon={
            <SvgXml
              xml={eventIcon()}
              width={20}
              height={20}
              color={
                activeTab === EventDetailTab.About
                  ? theme.colors.primary
                  : theme.colors.baseShade3
              }
            />
          }
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveTab(EventDetailTab.Discussion)}>
        <IconTab
          isActive={activeTab === EventDetailTab.Discussion}
          themeStyles={theme}
          icon={
            <SvgXml
              xml={eventDiscussion()}
              width={20}
              height={20}
              color={
                activeTab === EventDetailTab.Discussion
                  ? theme.colors.primary
                  : theme.colors.baseShade3
              }
            />
          }
        />
      </TouchableOpacity>
    </View>
  );

  const showComposerFab =
    activeTab === EventDetailTab.Discussion &&
    !!event.targetCommunity?.isJoined &&
    !isVisitorOrBot;

  return (
    <View
      style={styles.page}
      testID={accessibilityId}
      accessibilityLabel={accessibilityId}
    >
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <EventCoverImage url={event.coverImage?.fileUrl} />
        <EventDescription event={event} />
        <RSVPButton
          event={event}
          myRSVP={myRSVP}
          setMyRSVP={setMyRSVP}
          onRefresh={refresh}
        />
        <View
          onLayout={(e) => {
            tabsYRef.current = e.nativeEvent.layout.y;
          }}
        >
          {renderTabs()}
        </View>
        {activeTab === EventDetailTab.About ? (
          <EventInfo pageId={pageId} event={event} />
        ) : (
          <EventDiscussion ref={discussionRef} pageId={pageId} event={event} />
        )}
      </ScrollView>
      {sticky && <View style={fabStyles.stickyTabs}>{renderTabs()}</View>}
      <EventTopBar
        event={event}
        withTitle={isBackgroundShown}
        isBackgroundShown={isBackgroundShown}
        topInset={insets.top}
      />
      {showComposerFab && (
        <FloatingButton onPress={onPressComposerFab} isGlobalFeed={false} />
      )}
    </View>
  );
};

export default memo(AmityEventDetailPage);
