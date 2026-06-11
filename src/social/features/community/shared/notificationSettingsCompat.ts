import { Client } from '@amityco/ts-sdk-react-native';

/**
 * Compatibility layer for the community notification-settings API.
 *
 * This branch previously pinned the unreleased dev SDK build
 * `7.18.1-72bd324a.0`, which ships `Client.notifications()` plus the
 * notification-settings enums/types. The Events feature requires the public
 * SDK `^7.22.0`, which does not include that API yet. Until a public release
 * carries both, the enums/types are mirrored here (string-identical, so
 * runtime behaviour is unchanged) and the runtime client is accessed
 * defensively: on SDK builds without `Client.notifications()` the calls
 * reject and the settings screens surface their normal error states.
 *
 * Once the SDK exports these publicly, delete this module and restore the
 * direct `@amityco/ts-sdk-react-native` imports.
 */

// Mirrors dev-SDK CommunityNotificationEventNameEnum
export enum CommunityNotificationEventNameEnum {
  POST_CREATED = 'post.created',
  POST_REACTED = 'post.reacted',
  COMMENT_CREATED = 'comment.created',
  COMMENT_REPLIED = 'comment.replied',
  COMMENT_REACTED = 'comment.reacted',
  STORY_CREATED = 'story.created',
  STORY_REACTED = 'story.reacted',
  STORY_COMMENT_CREATED = 'story-comment.created',
  LIVESTREAM_START = 'video-streaming.didStart',
}

// Mirrors dev-SDK NotificationRolesFilterTypeEnum
export enum NotificationRolesFilterTypeEnum {
  ALL = 'all',
  ONLY = 'only',
}

declare global {
  namespace Amity {
    type CommunityNotificationEventName = CommunityNotificationEventNameEnum;
    type NotificationRolesFilter =
      | { type: NotificationRolesFilterTypeEnum.ALL }
      | { type: NotificationRolesFilterTypeEnum.ONLY; roleIds: string[] }
      | { type: 'not'; roleIds: string[] };
    type CommunityNotificationEvent = {
      eventName: Amity.CommunityNotificationEventName;
      isEnabled: boolean;
      /** @readonly Populated by SDK on read. Silently ignored on write. */
      isNetworkEnabled?: boolean;
      rolesFilter?: Amity.NotificationRolesFilter;
    };
    type CommunityNotificationSettings = {
      isEnabled: boolean;
      events: Amity.CommunityNotificationEvent[];
    };
  }
}

type CommunityNotificationsClient = {
  getSettings: () => Promise<Amity.CommunityNotificationSettings>;
  enable: (
    events?: Amity.CommunityNotificationEvent[]
  ) => Promise<Amity.CommunityNotificationSettings>;
  disable: () => Promise<Amity.CommunityNotificationSettings>;
};

/**
 * Defensive accessor for the dev-SDK community notifications client.
 * Rejects with a descriptive error on SDK builds that lack the API.
 */
export const communityNotifications = (
  communityId: string
): CommunityNotificationsClient => {
  const notifications = (
    Client as unknown as {
      notifications?: () => {
        community: (id: string) => CommunityNotificationsClient;
      };
    }
  ).notifications;
  if (!notifications) {
    const unavailable = () =>
      Promise.reject(
        new Error(
          'Community notification settings are not available in this SDK build'
        )
      );
    return {
      getSettings: unavailable,
      enable: unavailable,
      disable: unavailable,
    };
  }
  return notifications().community(communityId);
};
