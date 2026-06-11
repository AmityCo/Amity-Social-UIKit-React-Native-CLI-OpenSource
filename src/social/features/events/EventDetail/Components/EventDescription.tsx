import React, { FC, memo, useCallback } from 'react';
import dayjs from 'dayjs';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AmityEventStatus, AmityEventType } from '@amityco/ts-sdk-react-native';
import {
  brandBadge,
  eventAttendee,
  eventLocation,
  eventRecord,
  lock,
  verifiedBadge,
} from '../../../../../core/assets/icons';
import { Typography } from '../../../../../core/components/Typography/Typography';
import {
  EVENTS_STRINGS,
  EVENT_STATUS_LABEL,
  EVENT_TYPE_LABEL,
} from '../../constants';
import {
  checkIsWithinMinutes,
  formatEventDuration,
  millify,
} from '../../utils';
import useFile from '../../../../../core/hooks/useFile';
import { defaultAvatarUri } from '../../../../../core/assets';
import { useBehaviour } from '../../../../providers/BehaviourProvider';
import useAuth from '../../../../../core/hooks/useAuth';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';
import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';

type EventDescriptionProps = {
  event: Amity.Event;
};

/**
 * Web parity: EventDescription — status/community row, title, date badge with
 * start time, event type row, attendees row (hidden for visitors), host row,
 * and the host-only "Set up live stream" CTA.
 */
const EventDescription: FC<EventDescriptionProps> = ({ event }) => {
  const theme = useTheme<MyMD3Theme>();
  const { client, isVisitorOrBot } = useAuth();
  const { AmityEventDetailPageBehaviour } = useBehaviour();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentUserId = (client as Amity.Client)?.userId;

  const hostAvatarUrl =
    useFile({ fileId: event.creator?.avatarFileId ?? '' }) ?? defaultAvatarUri;

  const isWithin15Minutes = checkIsWithinMinutes(event.startTime);
  const canSetupLiveStream =
    (isWithin15Minutes || event.status === AmityEventStatus.Live) &&
    event.room?.status === 'idle' &&
    event.userId === currentUserId;

  const onPressCommunity = useCallback(() => {
    if (AmityEventDetailPageBehaviour?.goToCommunityProfilePage) {
      return AmityEventDetailPageBehaviour.goToCommunityProfilePage({
        communityId: event.originId,
      });
    }
    navigation.navigate('CommunityProfilePage', {
      communityId: event.originId,
    });
  }, [AmityEventDetailPageBehaviour, navigation, event.originId]);

  const onPressAttendees = useCallback(() => {
    if (AmityEventDetailPageBehaviour?.goToEventAttendeesPage) {
      return AmityEventDetailPageBehaviour.goToEventAttendeesPage({ event });
    }
    navigation.navigate('EventAttendees', { event });
  }, [AmityEventDetailPageBehaviour, navigation, event]);

  const onPressHost = useCallback(() => {
    if (AmityEventDetailPageBehaviour?.goToUserProfilePage) {
      return AmityEventDetailPageBehaviour.goToUserProfilePage({
        userId: event.userId,
      });
    }
    navigation.navigate('UserProfile', { userId: event.userId });
  }, [AmityEventDetailPageBehaviour, navigation, event.userId]);

  const onPressSetupLiveStream = useCallback(() => {
    if (!event.discussionCommunityId) return;
    if (AmityEventDetailPageBehaviour?.goToCreateLivestreamPage) {
      return AmityEventDetailPageBehaviour.goToCreateLivestreamPage({
        targetId: event.discussionCommunityId,
        targetType: 'community',
        event,
      });
    }
    navigation.navigate('CreateLivestream', {
      targetId: event.discussionCommunityId,
      targetType: 'community',
      targetName: event.title,
    });
  }, [AmityEventDetailPageBehaviour, navigation, event]);

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    communityRow: {
      gap: 4,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    status: {
      textTransform: 'uppercase',
      color: theme.colors.baseShade1,
    },
    communityName: {
      flexShrink: 1,
      color: theme.colors.base,
    },
    communityNameButton: {
      flexShrink: 1,
    },
    title: {
      marginBottom: 20,
      color: theme.colors.base,
    },
    details: {
      gap: 8,
    },
    row: {
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateIconContainer: {
      width: 40,
      height: 40,
      borderWidth: 1,
      borderRadius: 8,
      overflow: 'hidden',
      borderColor: theme.colors.baseShade4,
    },
    dateIconMonth: {
      fontSize: 8,
      lineHeight: 12,
      paddingVertical: 2,
      textAlign: 'center',
      textTransform: 'uppercase',
      color: theme.colors.baseShade1,
      backgroundColor: theme.colors.baseShade4,
    },
    dateIconDay: {
      textAlign: 'center',
      color: theme.colors.base,
    },
    iconContainer: {
      padding: 10,
      borderWidth: 1,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.baseShade4,
    },
    rowLabel: {
      color: theme.colors.baseShade2,
    },
    rowValue: {
      color: theme.colors.base,
    },
    rowValueContainer: {
      flex: 1,
    },
    hostAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    hostInfo: {
      gap: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    hostName: {
      flexShrink: 1,
      color: theme.colors.base,
    },
    setUpLiveStreamButton: {
      gap: 8,
      marginTop: 20,
      marginBottom: 16,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    setUpLiveStreamText: {
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.communityRow}>
        <Typography.CaptionBold style={styles.status}>
          {EVENT_STATUS_LABEL[event.status]}
        </Typography.CaptionBold>
        <Typography.CaptionBold style={styles.status}>•</Typography.CaptionBold>
        {!event.targetCommunity?.isPublic && (
          <SvgXml
            xml={lock()}
            width={16}
            height={16}
            color={theme.colors.baseShade1}
          />
        )}
        <TouchableOpacity
          onPress={onPressCommunity}
          style={styles.communityNameButton}
        >
          <Typography.BodyBold style={styles.communityName} numberOfLines={1}>
            {event.targetCommunity?.displayName}
          </Typography.BodyBold>
        </TouchableOpacity>
        {event.targetCommunity?.isOfficial && (
          <SvgXml
            xml={verifiedBadge()}
            width={16}
            height={16}
            color={theme.colors.primary}
          />
        )}
      </View>
      <Typography.Headline style={styles.title} numberOfLines={2}>
        {event.title}
      </Typography.Headline>
      <View style={styles.details}>
        <View style={styles.row}>
          <View style={styles.dateIconContainer}>
            <Typography.CaptionSmall style={styles.dateIconMonth}>
              {dayjs(event.startTime).format('MMM')}
            </Typography.CaptionSmall>
            <Typography.TitleBold style={styles.dateIconDay}>
              {dayjs(event.startTime).format('D')}
            </Typography.TitleBold>
          </View>
          <View style={styles.rowValueContainer}>
            <Typography.Caption style={styles.rowLabel}>
              {EVENTS_STRINGS.STARTS}
            </Typography.Caption>
            <Typography.BodyBold style={styles.rowValue}>
              {formatEventDuration(event.startTime, event.endTime)}
            </Typography.BodyBold>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <SvgXml
              xml={
                event.type === AmityEventType.Virtual
                  ? eventRecord()
                  : eventLocation()
              }
              width={20}
              height={20}
              color={theme.colors.base}
            />
          </View>
          <View style={styles.rowValueContainer}>
            <Typography.Caption style={styles.rowLabel}>
              {EVENTS_STRINGS.EVENT_TYPE}
            </Typography.Caption>
            <Typography.BodyBold style={styles.rowValue}>
              {EVENT_TYPE_LABEL[event.type]}
            </Typography.BodyBold>
          </View>
        </View>
        {/* Web parity: RSVP count hidden for visitors */}
        {event.rsvpCount > 0 && !isVisitorOrBot && (
          <TouchableOpacity style={styles.row} onPress={onPressAttendees}>
            <View style={styles.iconContainer}>
              <SvgXml
                xml={eventAttendee()}
                width={20}
                height={20}
                color={theme.colors.base}
              />
            </View>
            <View style={styles.rowValueContainer}>
              <Typography.Caption style={styles.rowLabel}>
                {EVENTS_STRINGS.ATTENDEES}
              </Typography.Caption>
              <Typography.BodyBold style={styles.rowValue}>
                {millify(event.rsvpCount)}
              </Typography.BodyBold>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.row}
          onPress={onPressHost}
          accessibilityLabel="Click to go host profile"
        >
          <Image source={{ uri: hostAvatarUrl }} style={styles.hostAvatar} />
          <View style={styles.rowValueContainer}>
            <Typography.Caption style={styles.rowLabel}>
              {EVENTS_STRINGS.HOSTED_BY}
            </Typography.Caption>
            <View style={styles.hostInfo}>
              <Typography.BodyBold style={styles.hostName} numberOfLines={1}>
                {event.creator?.displayName || event.userPublicId}
              </Typography.BodyBold>
              {event.creator?.isBrand && (
                <SvgXml xml={brandBadge()} width={16} height={16} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
      {canSetupLiveStream && (
        <TouchableOpacity
          style={styles.setUpLiveStreamButton}
          onPress={onPressSetupLiveStream}
        >
          <SvgXml xml={eventRecord()} width={20} height={20} color="#FFFFFF" />
          <Typography.BodyBold style={styles.setUpLiveStreamText}>
            {EVENTS_STRINGS.SET_UP_LIVE_STREAM}
          </Typography.BodyBold>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(EventDescription);
