import { FC, memo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import { AmityEventResponseStatus } from '@amityco/ts-sdk-react-native';
import {
  eventCalendarIllustration,
  eventPeople,
} from '../../../../../core/assets/icons';
import { Typography } from '../../../../../core/components/Typography/Typography';
import { EVENTS_STRINGS } from '../../constants';
import useFile from '../../../../../core/hooks/useFile';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';

export const MEMBER_SHEET_HEIGHT = 360;
export const NON_MEMBER_SHEET_HEIGHT = 440;
export const UPDATE_STATUS_SHEET_HEIGHT = 200;

const useSheetStyles = () => {
  const theme = useTheme<MyMD3Theme>();
  const styles = StyleSheet.create({
    sheet: {
      alignItems: 'center',
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    calendarIcon: {
      marginVertical: 20,
    },
    sheetText: {
      padding: 16,
      alignItems: 'center',
    },
    headline: {
      textAlign: 'center',
      color: theme.colors.base,
    },
    body: {
      paddingTop: 8,
      textAlign: 'center',
      color: theme.colors.baseShade1,
    },
    divider: {
      height: 1,
      width: '100%',
      marginBottom: 16,
      backgroundColor: theme.colors.baseShade4,
    },
    fillButton: {
      width: '100%',
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    fillButtonText: {
      color: '#FFFFFF',
    },
    outlinedButton: {
      width: '100%',
      marginTop: 12,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.secondaryShade3 ?? theme.colors.baseShade3,
      backgroundColor: theme.colors.background,
    },
    outlinedButtonText: {
      color: theme.colors.base,
    },
    coverImageContainer: {
      paddingVertical: 20,
    },
    coverImageWrapper: {
      width: 120,
      height: 120,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryShade2 ?? theme.colors.primary,
    },
    coverImage: {
      width: 120,
      height: 120,
      borderRadius: 12,
    },
    userAvatar: {
      width: 56,
      height: 56,
      right: -16,
      bottom: -16,
      borderWidth: 4,
      borderRadius: 28,
      position: 'absolute',
      borderColor: theme.colors.background,
    },
    radioRow: {
      width: '100%',
      paddingVertical: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    radioLabel: {
      color: theme.colors.base,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.baseShade2,
    },
    radioOuterActive: {
      borderColor: theme.colors.primary,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
    },
  });
  return { styles, theme };
};

/**
 * Web parity: MemberBottomSheet — post-RSVP confirmation. The Web "Add to
 * calendar" button (ICS download) is omitted on RN: no calendar/file module
 * is bundled with the UIKit (documented deviation).
 */
export const MemberBottomSheet: FC = memo(() => {
  const { styles } = useSheetStyles();
  return (
    <View style={styles.sheet}>
      <View style={styles.calendarIcon}>
        <SvgXml xml={eventCalendarIllustration()} width={120} height={120} />
      </View>
      <View style={styles.sheetText}>
        <Typography.Headline style={styles.headline}>
          {EVENTS_STRINGS.YOU_WILL_BE_NOTIFIED}
        </Typography.Headline>
        <Typography.Body style={styles.body}>
          {EVENTS_STRINGS.ADD_CALENDAR_DESCRIPTION}
        </Typography.Body>
      </View>
    </View>
  );
});

type NonMemberBottomSheetProps = {
  event: Amity.Event;
  currentUserAvatarFileId?: string;
  onPressJoin: () => void;
  onClose: () => void;
};

/**
 * Web parity: NonMemberBottomSheet — join the event's community before
 * RSVPing. Community avatar block with the current user's avatar overlapped.
 */
export const NonMemberBottomSheet: FC<NonMemberBottomSheetProps> = memo(
  ({ event, currentUserAvatarFileId, onPressJoin, onClose }) => {
    const { styles } = useSheetStyles();
    const communityAvatarUrl = useFile({
      fileId: event.targetCommunity?.avatarFileId ?? '',
    });
    const userAvatarUrl = useFile({ fileId: currentUserAvatarFileId ?? '' });

    return (
      <View style={styles.sheet}>
        <View style={styles.coverImageContainer}>
          <View style={styles.coverImageWrapper}>
            {communityAvatarUrl ? (
              <Image
                source={{ uri: communityAvatarUrl }}
                style={styles.coverImage}
              />
            ) : (
              <SvgXml
                xml={eventPeople()}
                width={72}
                height={40}
                color="#FFFFFF"
              />
            )}
          </View>
          {!!userAvatarUrl && (
            <Image source={{ uri: userAvatarUrl }} style={styles.userAvatar} />
          )}
        </View>
        <View style={styles.sheetText}>
          <Typography.Headline style={styles.headline}>
            {EVENTS_STRINGS.JOIN_COMMUNITY_TO_CONTINUE}
          </Typography.Headline>
          <Typography.Body style={styles.body}>
            {EVENTS_STRINGS.JOIN_TO_ATTEND_EVENTS(
              event.targetCommunity?.displayName ?? ''
            )}
          </Typography.Body>
        </View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.fillButton} onPress={onPressJoin}>
          <Typography.BodyBold style={styles.fillButtonText}>
            {event.targetCommunity?.requiresJoinApproval
              ? EVENTS_STRINGS.JOIN_COMMUNITY
              : EVENTS_STRINGS.JOIN_COMMUNITY_AND_RSVP}
          </Typography.BodyBold>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlinedButton} onPress={onClose}>
          <Typography.BodyBold style={styles.outlinedButtonText}>
            {EVENTS_STRINGS.CANCEL}
          </Typography.BodyBold>
        </TouchableOpacity>
      </View>
    );
  }
);

type UpdateStatusBottomSheetProps = {
  rsvp?: Amity.EventResponse;
  onPressChangeStatus: (status: Amity.EventResponseStatus) => void;
};

/**
 * Web parity: UpdateStatusBottomSheet — Going / Not going radio options.
 */
export const UpdateStatusBottomSheet: FC<UpdateStatusBottomSheetProps> = memo(
  ({ rsvp, onPressChangeStatus }) => {
    const { styles } = useSheetStyles();
    const options = [
      {
        label: EVENTS_STRINGS.GOING,
        value: AmityEventResponseStatus.Going,
      },
      {
        label: EVENTS_STRINGS.NOT_GOING,
        value: AmityEventResponseStatus.NotGoing,
      },
    ];

    return (
      <View style={styles.sheet}>
        {options.map((option) => {
          const isActive = rsvp?.status === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={styles.radioRow}
              onPress={() => onPressChangeStatus(option.value)}
            >
              <Typography.BodyBold style={styles.radioLabel}>
                {option.label}
              </Typography.BodyBold>
              <View
                style={[styles.radioOuter, isActive && styles.radioOuterActive]}
              >
                {isActive && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
);
