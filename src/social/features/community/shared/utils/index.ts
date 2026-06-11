import { MemberRoles } from '../../../../../core/constants';
import { NotificationRolesFilterTypeEnum } from '../notificationSettingsCompat';
import { NOTIFICATION_RADIO_OPTIONS } from '../constants';

export type NotificationRadioValue =
  (typeof NOTIFICATION_RADIO_OPTIONS)[keyof typeof NOTIFICATION_RADIO_OPTIONS];

export function getNotificationEventValue(
  events: Amity.CommunityNotificationEvent[] | undefined,
  eventName: string
): NotificationRadioValue {
  const event = events?.find((e) => e.eventName === eventName);

  if (!event || !event.isEnabled) return NOTIFICATION_RADIO_OPTIONS.off;

  if (event.rolesFilter?.type === NotificationRolesFilterTypeEnum.ONLY)
    return NOTIFICATION_RADIO_OPTIONS.onlyModerator;

  return NOTIFICATION_RADIO_OPTIONS.everyone;
}

export function buildNotificationEvent(
  eventName: Amity.CommunityNotificationEventName,
  value: NotificationRadioValue
): Amity.CommunityNotificationEvent {
  if (value === NOTIFICATION_RADIO_OPTIONS.off)
    return { eventName, isEnabled: false };

  return {
    eventName,
    isEnabled: true,
    rolesFilter:
      value === NOTIFICATION_RADIO_OPTIONS.onlyModerator
        ? {
            type: NotificationRolesFilterTypeEnum.ONLY,
            roleIds: [MemberRoles.COMMUNITY_MODERATOR],
          }
        : { type: NotificationRolesFilterTypeEnum.ALL },
  };
}
