import React, { FC, memo, useCallback } from 'react';
import {
  Alert,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventRepository, FileRepository } from '@amityco/ts-sdk-react-native';
import { arrowLeft, menu } from '../../../../../core/assets/icons';
import { Typography } from '../../../../../core/components/Typography/Typography';
import { EVENTS_STRINGS } from '../../constants';
import { checkIsWithinMinutes } from '../../utils';
import { useEventPermission } from '../../hooks/useEventPermission';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { useBottomSheet } from '../../../../../core/stores/slices/bottomSheetSlice';
import { useBehaviour } from '../../../../providers/BehaviourProvider';
import useAuth from '../../../../../core/hooks/useAuth';
import type { MyMD3Theme } from '../../../../../core/providers/AmityUIKitProvider';
import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';

type EventTopBarProps = {
  event: Amity.Event;
  withTitle?: boolean;
  isBackgroundShown?: boolean;
  topInset: number;
};

/**
 * Web parity: EventActions — floating back button + overflow menu over the
 * cover; once the cover scrolls away the bar shows the cover image as its
 * background with the event title. Menu actions: Edit event (host only,
 * blocked within 15 minutes of start) and Delete event (host or
 * DELETE_EVENT permission). Web's "Add to calendar" (ICS download) and
 * "Copy event link" (sharable-link service) actions are omitted on RN —
 * documented deviations.
 */
const EventTopBar: FC<EventTopBarProps> = ({
  event,
  withTitle = false,
  isBackgroundShown = false,
  topInset,
}) => {
  const theme = useTheme<MyMD3Theme>();
  const { client } = useAuth();
  const { showToast } = useToast();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const { AmityEventDetailPageBehaviour } = useBehaviour();
  const { hasDeleteEventPermission } = useEventPermission(event.originId);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentUserId = (client as Amity.Client)?.userId;
  const isHostEvent = event.creator?.userId === currentUserId;

  const onPressEdit = useCallback(() => {
    closeBottomSheet();
    if (checkIsWithinMinutes(event.startTime)) {
      Alert.alert(
        EVENTS_STRINGS.EDITING_NOT_POSSIBLE,
        EVENTS_STRINGS.EDITING_NOT_POSSIBLE_DESCRIPTION,
        [{ text: EVENTS_STRINGS.OK }]
      );
      return;
    }
    if (AmityEventDetailPageBehaviour?.goToEventSetupPage) {
      return AmityEventDetailPageBehaviour.goToEventSetupPage({
        mode: 'edit',
        event,
      });
    }
    navigation.navigate('EventSetup', { mode: 'edit', event });
  }, [closeBottomSheet, event, AmityEventDetailPageBehaviour, navigation]);

  const onPressDelete = useCallback(() => {
    closeBottomSheet();
    Alert.alert(
      EVENTS_STRINGS.DELETE_THIS_EVENT,
      EVENTS_STRINGS.DELETE_EVENT_DESCRIPTION,
      [
        { text: EVENTS_STRINGS.CANCEL, style: 'cancel' },
        {
          text: EVENTS_STRINGS.DELETE,
          style: 'destructive',
          onPress: async () => {
            try {
              await EventRepository.deleteEvent(event.eventId);
              navigation.goBack();
              showToast({
                message: EVENTS_STRINGS.EVENT_DELETED,
                type: 'success',
              });
            } catch {
              showToast({
                message: EVENTS_STRINGS.DELETE_EVENT_FAILED,
                type: 'informative',
              });
            }
          },
        },
      ]
    );
  }, [closeBottomSheet, event.eventId, navigation, showToast]);

  const styles = StyleSheet.create({
    topBar: {
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      position: 'absolute',
    },
    background: {
      backgroundColor: theme.colors.baseShade2,
    },
    row: {
      gap: 16,
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: topInset + 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: {
      gap: 12,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      flexShrink: 1,
      color: '#FFFFFF',
    },
    circleButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuSheet: {
      paddingHorizontal: 16,
    },
    menuRow: {
      gap: 12,
      paddingVertical: 16,
      alignItems: 'center',
      flexDirection: 'row',
    },
    menuLabel: {
      color: theme.colors.base,
    },
    menuLabelDestructive: {
      color: theme.colors.alert,
    },
  });

  const menuActions = [
    isHostEvent && {
      key: 'edit',
      label: EVENTS_STRINGS.EDIT_EVENT,
      destructive: false,
      onPress: onPressEdit,
    },
    (hasDeleteEventPermission || isHostEvent) && {
      key: 'delete',
      label: EVENTS_STRINGS.DELETE_EVENT,
      destructive: true,
      onPress: onPressDelete,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    destructive: boolean;
    onPress: () => void;
  }[];

  const onPressMenu = useCallback(() => {
    openBottomSheet({
      content: (
        <View style={styles.menuSheet}>
          {menuActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.menuRow}
              onPress={action.onPress}
            >
              <Typography.BodyBold
                style={
                  action.destructive
                    ? styles.menuLabelDestructive
                    : styles.menuLabel
                }
              >
                {action.label}
              </Typography.BodyBold>
            </TouchableOpacity>
          ))}
        </View>
      ),
      height: 64 + menuActions.length * 56,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBottomSheet, menuActions]);

  const barContent = (
    <View style={styles.row}>
      <View style={styles.left}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
        >
          <SvgXml xml={arrowLeft()} width={20} height={20} color="#FFFFFF" />
        </TouchableOpacity>
        {withTitle && (
          <Typography.TitleBold style={styles.title} numberOfLines={1}>
            {event.title}
          </Typography.TitleBold>
        )}
      </View>
      {menuActions.length > 0 && (
        <TouchableOpacity style={styles.circleButton} onPress={onPressMenu}>
          <SvgXml xml={menu()} width={20} height={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (isBackgroundShown) {
    return (
      <View style={[styles.topBar, styles.background]}>
        {event.coverImage?.fileUrl ? (
          <ImageBackground
            source={{
              uri: FileRepository.fileUrlWithSize(
                event.coverImage.fileUrl,
                'medium'
              ),
            }}
            resizeMode="cover"
          >
            {barContent}
          </ImageBackground>
        ) : (
          barContent
        )}
      </View>
    );
  }

  return <View style={styles.topBar}>{barContent}</View>;
};

export default memo(EventTopBar);
