// AmityConversationChatUserActionComponent — RN port of the 1-1 conversation
// user action menu that AmityUiKitWeb builds in
// `conversation/chat/hooks/useConversationActions` (block / report / notification).
//
// RN MOBILE ADAPTATION: web mounts this menu in a desktop Popover triggered from
// the conversation Header's trailing button. On RN it is a native BOTTOM SHEET —
// the component now owns the trailing "⋮" trigger and, on press, pushes the same
// action list into the repo's global @devvie bottom sheet
// (`useBottomSheet` → BottomSheetComponent). The menu body reuses the SoT `Menu`
// in its `drawer` container (mirrors the web mobile drawer). Only the CONTAINER
// changed Popover → bottom sheet: the items, handlers, labels, tokens and
// destructive confirmations are unchanged.
//
// This mirrors web `useConversationActions` (and iOS
// `AmityConversationChatUserActionComponent`): three actions — notification
// (mute/unmute), report, block. The notification row toggles the channel push
// setting via `Client.notifications().channel(id)` (enable → unmuted, disable →
// muted), the exact surface the group notification-preference port uses; its
// state is read once from `getSettings().isEnabled`. Icon/label are action-facing:
// enabled → `bell-slash-r` + "Turn off notification"; disabled → `bell-s` +
// "Turn on notification" (iOS `bellSlashR`/`bellS`). `isBlockedByMe` is read live
// from `UserRepository.Relationship.getFollowInfo` (`status === 'blocked'`) so the
// block/unblock label is always correct; report is a single flag action. Web's
// `ConfirmProvider` maps to the native `Alert.alert`. SDK calls are gated on
// `useAuth().isConnected`.

// 1. React / RN imports
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

// 2. Third-party imports
import { Client, UserRepository } from '@amityco/ts-sdk-react-native';

// 3. Internal imports
import { Menu } from '../../../../../core/design/components/Menu';
import {
  AmityIcon,
  type AmityIconName,
} from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { resolveString } from '../../../../../core/localization';
import useAuth from '../../../../../core/hooks/useAuth';
import { useBottomSheet } from '../../../../../core/stores/slices/bottomSheetSlice';
import { useToast } from '../../../../../core/stores/slices/toastSlice';
import { useChatNotifications } from '../../hooks/useChatNotifications';
import { useStyles } from './styles';

// 4. Types
type AmityConversationChatUserActionComponentProps = {
  user: Amity.InternalUser;
  channelId: string;
};

type ActionItem = {
  key: string;
  icon: AmityIconName;
  label: string;
  onPress: () => void;
};

// 5. Named function component
export function AmityConversationChatUserActionComponent({
  user,
  channelId,
}: AmityConversationChatUserActionComponentProps) {
  const { styles } = useStyles();
  const { isConnected } = useAuth();
  const { success } = useChatNotifications();
  const { showToast } = useToast();
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();

  const userId = user.userId;
  const displayName = user.displayName ?? user.userId;

  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  // Channel push-notification state (web `useChannelPushNotificationQuery`):
  // read once from `getSettings().isEnabled`; the row toggles it live.
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  useEffect(() => {
    if (!isConnected || !userId) return undefined;
    const unsub = UserRepository.Relationship.getFollowInfo(
      userId,
      ({ data }) => {
        setIsBlockedByMe(data?.status === 'blocked');
      }
    );
    return () => {
      unsub();
    };
  }, [isConnected, userId]);

  useEffect(() => {
    if (!isConnected || !channelId) return undefined;
    let active = true;
    Client.notifications()
      .channel(channelId)
      .getSettings()
      .then((settings) => {
        if (active) setIsNotificationEnabled(settings.isEnabled);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isConnected, channelId]);

  async function handleToggleNotification() {
    if (!isConnected || !channelId) return;
    const next = !isNotificationEnabled;
    try {
      const manager = Client.notifications().channel(channelId);
      if (next) {
        await manager.enable();
      } else {
        await manager.disable();
      }
      setIsNotificationEnabled(next);
      showToast({
        message: resolveString(
          next ? 'amity_chat_action_unmute' : 'amity_chat_action_mute'
        ),
        type: 'success',
      });
    } catch {
      showToast({
        message: resolveString(
          next
            ? 'amity_chat_action_unmute_failed'
            : 'amity_chat_action_mute_failed'
        ),
        type: 'failed',
      });
    }
  }

  async function handleReport() {
    if (!isConnected) return;
    await UserRepository.flagUser(userId);
    success({
      content: resolveString('amity_chat_action_report_user_success'),
    });
  }

  function handleToggleBlock() {
    if (!isConnected) return;
    if (isBlockedByMe) {
      Alert.alert(
        resolveString('amity_chat_unblock_confirm_title'),
        resolveString('amity_chat_unblock_confirm_message', displayName),
        [
          { text: resolveString('amity_chat_cancel'), style: 'cancel' },
          {
            text: resolveString('amity_chat_unblock_confirm_label'),
            onPress: async () => {
              await UserRepository.Relationship.unBlockUser(userId);
              success({ content: resolveString('amity_chat_unblock_success') });
            },
          },
        ]
      );
    } else {
      Alert.alert(
        resolveString('amity_chat_block_confirm_title'),
        resolveString('amity_chat_block_confirm_message', displayName),
        [
          { text: resolveString('amity_chat_cancel'), style: 'cancel' },
          {
            text: resolveString('amity_chat_block_confirm_label'),
            style: 'destructive',
            onPress: async () => {
              await UserRepository.Relationship.blockUser(userId);
              success({ content: resolveString('amity_chat_block_success') });
            },
          },
        ]
      );
    }
  }

  const items: ActionItem[] = [
    {
      key: 'notification',
      icon: isNotificationEnabled ? 'bell-slash-r' : 'bell-s',
      label: resolveString(
        isNotificationEnabled
          ? 'amity_chat_action_turn_off_notification'
          : 'amity_chat_action_turn_on_notification'
      ),
      onPress: handleToggleNotification,
    },
    {
      key: 'report',
      icon: 'flag-r',
      label: resolveString('amity_chat_action_report_user'),
      onPress: handleReport,
    },
    {
      key: 'block',
      icon: 'ban-r',
      label: resolveString(
        isBlockedByMe
          ? 'amity_chat_action_unblock_user'
          : 'amity_chat_action_block_user'
      ),
      onPress: handleToggleBlock,
    },
  ];

  function openActionSheet() {
    openBottomSheet({
      height: bottomSheetHeight[items.length as keyof typeof bottomSheetHeight],
      content: (
        <View style={styles.sheetContainer}>
          <Menu variant="chat" container="drawer">
            {items.map((item) => (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                label={item.label}
                typography="body"
                onPress={() => {
                  closeBottomSheet();
                  item.onPress();
                }}
              />
            ))}
          </Menu>
        </View>
      ),
    });
  }

  return (
    <Pressable
      onPress={openActionSheet}
      accessibilityRole="button"
      accessibilityLabel="Conversation actions"
    >
      <AmityIcon
        name="ellipsis-v-r"
        size={24}
        tokenColor={AmityColorToken.IconIconButtonGhostSecondaryDefault}
      />
    </Pressable>
  );
}
