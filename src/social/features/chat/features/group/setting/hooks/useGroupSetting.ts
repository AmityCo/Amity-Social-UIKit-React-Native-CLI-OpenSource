// useGroupSetting — RN port of AmityUiKitWeb v4/chat/features/group/setting/hooks/useGroupSetting.
// Owns the group-settings screen state: the live channel object, the viewer's
// moderator role, the visible setting rows and the leave-group flow.
//
// RN adaptations from web:
//   - Web `useChannelObject` → an inline `ChannelRepository.getChannel` live-object
//     subscription (gated on `useAuth().isConnected`, mirroring `useConversation`).
//   - Web `useChannelMyMembership(channel)` → the channel's own `myMembership`
//     live subscription, whose callback delivers `{ data: membership }`.
//   - Web `useChatNavigation` (in-memory page stack push/pop) → React Navigation.
//     The group sub-pages register in a later wave, so navigation is done through
//     an `any`-typed `useNavigation` (same pattern as `AmityChatHomePage`) so the
//     not-yet-registered route names typecheck.
//   - Web `useConfirmContext().confirm` (in-app dialog) → RN `Alert.alert`.
//   - Web `useNotifications('chat').success/error` → the redux toast (`useToast`).
//   - The two notification rows are now live (iOS-aligned): the "Group notifications"
//     row (moderator-only) opens the mode page and shows the current mode label
//     (Default/Silent/Subscribe) from `channel.notificationMode`; the "Notifications"
//     preference row (all members) opens the per-user toggle page and shows On/Off
//     from `Client.notifications().channel(id).getSettings().isEnabled` — the exact
//     surface the notification-preference port already uses.
//   - `SettingMenu` takes `iconName` (SoT icon name) rather than web's `icon`
//     element, and `accessibilityLabel` rather than web's `ariaLabel`.

// 1. React / RN imports
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// 2. Third-party imports
import {
  AmityChannelNotificationModeEnum,
  ChannelRepository,
  Client,
} from '@amityco/ts-sdk-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import useAuth from '../../../../../../../core/hooks/useAuth';
import useFile from '../../../../../../../core/hooks/useFile';
import { useString } from '../../../../../../../core/localization';
import { useToast } from '../../../../../../../core/stores/slices/toastSlice';
import type { SettingMenuProps } from '../../../../elements/SettingMenu';

// 4. Types
export type GroupSettingProps = {
  channelId: string;
};

export type SettingMenuItem = SettingMenuProps & {
  key: string;
  visible: boolean;
};

// Web reads MODERATOR_ROLES from chat/constants/memberRoles; inlined here to match
// the sibling RN port (AmityChatListItem) and keep the feature self-contained.
const MODERATOR_ROLES = [
  'moderator',
  'community-moderator',
  'channel-moderator',
];

function hasModeratorRole(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => MODERATOR_ROLES.includes(role));
}

// 5. Hook
export function useGroupSetting({ channelId }: GroupSettingProps) {
  const { isConnected } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [channel, setChannel] = useState<Amity.Channel | undefined>(undefined);
  const [roles, setRoles] = useState<string[] | undefined>(undefined);
  // Per-user channel push setting — drives the "Notifications" row's On/Off label.
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  // Live channel object (web `useChannelObject`).
  useEffect(() => {
    if (!isConnected || !channelId) return undefined;
    const unsub = ChannelRepository.getChannel(channelId, ({ data }) => {
      if (data) setChannel(data);
    });
    return () => {
      unsub();
    };
  }, [isConnected, channelId]);

  // Viewer's channel membership (web `useChannelMyMembership`).
  useEffect(() => {
    if (!channel) return undefined;
    const unsub = channel.myMembership(({ data }) => {
      setRoles(data?.roles);
    });
    return () => {
      unsub();
    };
  }, [channel]);

  // Channel push setting (web `useChannelPushNotificationQuery`) — drives the
  // trailing On/Off label. Reloaded on every screen focus (iOS
  // `loadNotificationStatus` on appear) so the label refreshes after the user
  // returns from AmityGroupNotificationPreferencePage having toggled it.
  useFocusEffect(
    useCallback(() => {
      if (!isConnected || !channelId) return undefined;
      let active = true;
      Client.notifications()
        .channel(channelId)
        .getSettings()
        .then((settings) => {
          if (active) setIsNotificationsEnabled(settings.isEnabled);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [isConnected, channelId])
  );

  const isModerator = hasModeratorRole(roles);
  const avatarUrl = useFile({ fileId: channel?.avatarFileId ?? '' });

  const groupSettingsSection = useString('amity_chat_group_settings_section');
  const yourPreferencesSection = useString(
    'amity_chat_your_preferences_section'
  );
  const leaveGroupLabel = useString('amity_chat_group_leave');

  const lastModTitle = useString('amity_chat_group_leave_last_mod_title');
  const lastModMessage = useString('amity_chat_group_leave_last_mod_message');
  const promoteMemberLabel = useString('amity_chat_group_promote_member');
  const cancelLabel = useString('amity_chat_cancel');
  const leaveTitle = useString('amity_chat_group_leave_confirm_title');
  const leaveMessage = useString('amity_chat_group_leave_confirm_message');
  const leaveConfirm = useString('amity_chat_group_leave_confirm_label');
  const leaveSuccessToast = useString('amity_chat_toast_group_chat_left');
  const leaveFailedToast = useString('amity_chat_action_leave_group_failed');

  const groupProfileLabel = useString('amity_chat_group_profile');
  const groupNotificationsLabel = useString('amity_chat_group_notifications');
  const memberPermissionsLabel = useString(
    'amity_chat_group_member_permissions'
  );
  const allMembersLabel = useString('amity_chat_group_members_label');
  const bannedUsersLabel = useString('amity_chat_group_banned_members');
  const notificationsLabel = useString('amity_chat_notifications_title');

  // Trailing labels (iOS `notificationModeLabel()` + On/Off).
  const modeDefaultLabel = useString(
    'amity_chat_group_notification_default_label'
  );
  const modeSilentLabel = useString(
    'amity_chat_group_notification_silent_label'
  );
  const modeSubscribeLabel = useString(
    'amity_chat_group_notification_subscribe_label'
  );
  const notificationsOnLabel = useString('amity_chat_notifications_on');
  const notificationsOffLabel = useString('amity_chat_notifications_off');

  const notificationModeLabel =
    channel?.notificationMode === AmityChannelNotificationModeEnum.Silent
      ? modeSilentLabel
      : channel?.notificationMode === AmityChannelNotificationModeEnum.Subscribe
      ? modeSubscribeLabel
      : modeDefaultLabel;
  const notificationsTrailing = isNotificationsEnabled
    ? notificationsOnLabel
    : notificationsOffLabel;

  function handleClose() {
    navigation.goBack();
  }

  function handleOpenGroupProfile() {
    navigation.navigate('AmityEditGroupProfilePage', { channelId });
  }

  function handleOpenGroupNotification() {
    navigation.navigate('AmityEditGroupNotificationPage', { channelId });
  }

  function handleOpenGroupMemberPermissions() {
    navigation.navigate('AmityEditGroupMemberPermissionsPage', { channelId });
  }

  function handleOpenGroupNotificationPreference() {
    navigation.navigate('AmityGroupNotificationPreferencePage', { channelId });
  }

  function handleOpenAllMembers() {
    navigation.navigate('AmityGroupMemberListPage', { channelId });
  }

  function handleOpenBannedMembers() {
    navigation.navigate('AmityBannedGroupMemberListPage', { channelId });
  }

  // Web `pop(); pop();` returns to the channel list past the group chat; on native
  // stack `pop(2)` does the same in a single, batching-safe call.
  function popToList() {
    if (typeof navigation.pop === 'function') {
      navigation.pop(2);
    } else {
      navigation.goBack();
      navigation.goBack();
    }
  }

  function handleLeaveGroup() {
    if (!isConnected || !channelId) return;
    const moderatorCount = channel?.moderatorMemberCount ?? 0;
    const isLastModerator = isModerator && moderatorCount <= 1;

    if (isLastModerator) {
      Alert.alert(lastModTitle, lastModMessage, [
        { text: cancelLabel, style: 'cancel' },
        {
          text: promoteMemberLabel,
          onPress: () => handleOpenAllMembers(),
        },
      ]);
      return;
    }

    Alert.alert(leaveTitle, leaveMessage, [
      { text: cancelLabel, style: 'cancel' },
      {
        text: leaveConfirm,
        style: 'destructive',
        onPress: async () => {
          try {
            await ChannelRepository.leaveChannel(channelId);
            popToList();
            showToast({ message: leaveSuccessToast, type: 'success' });
          } catch {
            showToast({ message: leaveFailedToast, type: 'failed' });
          }
        },
      },
    ]);
  }

  const groupItems: SettingMenuItem[] = [
    {
      key: 'group-profile',
      iconName: 'pen-s',
      label: groupProfileLabel,
      onPress: handleOpenGroupProfile,
      accessibilityLabel: groupProfileLabel,
      visible: isModerator,
    },
    {
      key: 'group-notifications',
      iconName: 'bell-s',
      label: groupNotificationsLabel,
      trailingText: notificationModeLabel,
      onPress: handleOpenGroupNotification,
      accessibilityLabel: groupNotificationsLabel,
      visible: isModerator,
    },
    {
      key: 'member-permissions',
      iconName: 'user-lock-s',
      label: memberPermissionsLabel,
      onPress: handleOpenGroupMemberPermissions,
      accessibilityLabel: memberPermissionsLabel,
      visible: isModerator,
    },
    {
      key: 'all-members',
      iconName: 'user-group-s',
      label: allMembersLabel,
      onPress: handleOpenAllMembers,
      accessibilityLabel: allMembersLabel,
      visible: true,
    },
    {
      key: 'banned-users',
      iconName: 'ban-s',
      label: bannedUsersLabel,
      onPress: handleOpenBannedMembers,
      accessibilityLabel: bannedUsersLabel,
      visible: isModerator,
    },
  ];

  const preferenceItems: SettingMenuItem[] = [
    {
      key: 'notifications',
      iconName: 'bell-s',
      label: notificationsLabel,
      trailingText: notificationsTrailing,
      onPress: handleOpenGroupNotificationPreference,
      accessibilityLabel: notificationsLabel,
      visible: true,
    },
  ];

  const visibleGroupItems = groupItems.filter((item) => item.visible);
  const visiblePreferenceItems = preferenceItems.filter((item) => item.visible);

  return {
    title: channel?.displayName ?? '',
    avatarUrl,
    groupSettingsSection,
    yourPreferencesSection,
    leaveGroupLabel,
    handleClose,
    handleLeaveGroup,
    visibleGroupItems,
    visiblePreferenceItems,
  };
}
