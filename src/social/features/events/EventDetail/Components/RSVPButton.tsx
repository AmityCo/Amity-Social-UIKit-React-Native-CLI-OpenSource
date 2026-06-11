import React, { FC, memo, useCallback } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import {
  AmityEventResponseStatus,
  AmityEventStatus,
} from '@amityco/ts-sdk-react-native';
import { eventBell, eventCheck, eventClose } from '../../../../../core/assets/icons';
import {
  MEMBER_SHEET_HEIGHT,
  MemberBottomSheet,
  NON_MEMBER_SHEET_HEIGHT,
  NonMemberBottomSheet,
  UPDATE_STATUS_SHEET_HEIGHT,
  UpdateStatusBottomSheet,
} from './RSVPBottomSheets';
import { Typography } from '../../../../../core/components/Typography/Typography';
import { EVENTS_STRINGS } from '../../constants';
import { useRSVP } from '../../hooks/useRSVP';
import { useUiKitConfig } from '../../../../hooks';
import { ComponentID, ElementID, PageID } from '../../../../enums';
import { useBottomSheet } from '../../../../../core/stores/slices/bottomSheetSlice';
import { useGlobalBehavior } from '../../../../hooks/useGlobalBehavior';
import useAuth from '../../../../../core/hooks/useAuth';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';

type RSVPButtonProps = {
  event: Amity.Event;
  myRSVP?: Amity.EventResponse;
  setMyRSVP: (rsvp?: Amity.EventResponse) => void;
  onRefresh?: () => void;
};

/**
 * Web parity: RSVPButton (mobile branch) — fill RSVP button for members and
 * non-members (join sheet), Going / Not going outlined status buttons that
 * open the update-status sheet, disabled once the event is no longer
 * scheduled, hidden for the event host, and a sign-in toast for visitors.
 */
const RSVPButton: FC<RSVPButtonProps> = ({
  event,
  myRSVP,
  setMyRSVP,
  onRefresh,
}) => {
  const theme = useTheme<MyMD3Theme>();
  const { client } = useAuth();
  const { handleGlobalBehavior, isVisitorOrBot } = useGlobalBehavior();
  const { createRSVP, updateRSVP } = useRSVP({ event });
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  const [rsvpButtonText] = useUiKitConfig({
    page: PageID.event_detail_page,
    component: ComponentID.WildCardComponent,
    element: ElementID.rsvp_button,
    keys: ['text'],
  }) as string[];

  const currentUserId = (client as Amity.Client)?.userId;
  const isDisabledStatusButton = event.status !== AmityEventStatus.Scheduled;
  const accessibilityId = `${PageID.event_detail_page}/*/${ElementID.rsvp_button}`;

  const showMemberSheet = useCallback(() => {
    openBottomSheet({
      content: <MemberBottomSheet />,
      height: MEMBER_SHEET_HEIGHT,
    });
  }, [openBottomSheet]);

  const handleMemberClick = useCallback(async () => {
    const response = await createRSVP(AmityEventResponseStatus.Going);
    if (!response) return;
    setMyRSVP(response);
    onRefresh?.();
    showMemberSheet();
  }, [createRSVP, setMyRSVP, onRefresh, showMemberSheet]);

  const handleJoinCommunity = useCallback(async () => {
    closeBottomSheet();
    if (!event.targetCommunity) return;
    try {
      // Web parity: community.join() link-object method
      await event.targetCommunity.join();
    } catch {
      return;
    }
    if (event.targetCommunity?.requiresJoinApproval) {
      Alert.alert(
        EVENTS_STRINGS.RSVP_AFTER_JOIN,
        EVENTS_STRINGS.JOIN_REQUEST_SENT,
        [{ text: EVENTS_STRINGS.OK }]
      );
      return;
    }
    const response = await createRSVP(AmityEventResponseStatus.Going);
    if (!response) return;
    setMyRSVP(response);
    onRefresh?.();
    showMemberSheet();
  }, [
    closeBottomSheet,
    event.targetCommunity,
    createRSVP,
    setMyRSVP,
    onRefresh,
    showMemberSheet,
  ]);

  const handleNonMemberClick = useCallback(() => {
    openBottomSheet({
      content: (
        <NonMemberBottomSheet
          event={event}
          onPressJoin={handleJoinCommunity}
          onClose={closeBottomSheet}
        />
      ),
      height: NON_MEMBER_SHEET_HEIGHT,
    });
  }, [openBottomSheet, event, handleJoinCommunity, closeBottomSheet]);

  const handleStatusChange = useCallback(
    async (status: Amity.EventResponseStatus) => {
      closeBottomSheet();
      const updatedRSVP = await updateRSVP(status);
      if (!updatedRSVP) return;
      setMyRSVP(updatedRSVP);
      onRefresh?.();
      if (updatedRSVP.status === AmityEventResponseStatus.Going) {
        showMemberSheet();
      }
    },
    [closeBottomSheet, updateRSVP, setMyRSVP, onRefresh, showMemberSheet]
  );

  const openChangeStatusSheet = useCallback(() => {
    openBottomSheet({
      content: (
        <UpdateStatusBottomSheet
          rsvp={myRSVP}
          onPressChangeStatus={handleStatusChange}
        />
      ),
      height: UPDATE_STATUS_SHEET_HEIGHT,
    });
  }, [openBottomSheet, myRSVP, handleStatusChange]);

  const onPressRSVP = useCallback(() => {
    handleGlobalBehavior({
      defaultBehavior: () => {
        if (event.targetCommunity?.isJoined) {
          handleMemberClick();
        } else {
          handleNonMemberClick();
        }
      },
    });
  }, [
    handleGlobalBehavior,
    event.targetCommunity?.isJoined,
    handleMemberClick,
    handleNonMemberClick,
  ]);

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: theme.colors.background,
    },
    rsvpButton: {
      gap: 8,
      width: '100%',
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    rsvpButtonText: {
      color: '#FFFFFF',
    },
    statusButton: {
      gap: 8,
      width: '100%',
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderColor: theme.colors.secondaryShade3 ?? theme.colors.baseShade3,
      backgroundColor: theme.colors.background,
    },
    statusButtonDisabled: {
      borderColor: theme.colors.secondaryShade4 ?? theme.colors.baseShade4,
    },
    statusButtonText: {
      color: theme.colors.base,
    },
    statusButtonTextDisabled: {
      color: theme.colors.secondaryShade3 ?? theme.colors.baseShade3,
    },
  });

  const statusIconColor = isDisabledStatusButton
    ? theme.colors.secondaryShade3 ?? theme.colors.baseShade3
    : theme.colors.base;

  // Web parity: status buttons (Going / Not going)
  if (
    myRSVP?.status === AmityEventResponseStatus.Going ||
    myRSVP?.status === AmityEventResponseStatus.NotGoing
  ) {
    const isGoing = myRSVP.status === AmityEventResponseStatus.Going;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          testID={accessibilityId}
          accessibilityLabel={accessibilityId}
          disabled={isDisabledStatusButton}
          style={[
            styles.statusButton,
            isDisabledStatusButton && styles.statusButtonDisabled,
          ]}
          onPress={openChangeStatusSheet}
        >
          <SvgXml
            xml={isGoing ? eventCheck() : eventClose()}
            width={20}
            height={20}
            color={statusIconColor}
          />
          <Typography.BodyBold
            style={[
              styles.statusButtonText,
              isDisabledStatusButton && styles.statusButtonTextDisabled,
            ]}
          >
            {isGoing ? EVENTS_STRINGS.GOING : EVENTS_STRINGS.NOT_GOING}
          </Typography.BodyBold>
        </TouchableOpacity>
      </View>
    );
  }

  // Web parity: RSVP CTA only for scheduled events not hosted by the viewer
  if (
    event.status !== AmityEventStatus.Scheduled ||
    (!isVisitorOrBot && event.userId === currentUserId)
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID={accessibilityId}
        accessibilityLabel={accessibilityId}
        style={styles.rsvpButton}
        onPress={onPressRSVP}
      >
        <SvgXml xml={eventBell()} width={20} height={20} color="#FFFFFF" />
        <Typography.BodyBold style={styles.rsvpButtonText}>
          {rsvpButtonText ?? EVENTS_STRINGS.RSVP}
        </Typography.BodyBold>
      </TouchableOpacity>
    </View>
  );
};

export default memo(RSVPButton);
