// AmityGroupMemberActionComponent — RN port of the member long-press action menu
// that AmityUiKitWeb builds inline in `group/members/components/MemberList`
// (`getActions`) and renders through its `ActionMenu`.
//
// Renders in the global @devvie bottom sheet (RN mobile adaptation; web uses a
// desktop popover) — mirrors the sibling AmityConversationChatUserActionComponent.
// The owning MemberItem row still wires the trailing ellipsis via the `anchor`
// render-prop, whose `openPopover` now opens the sheet. Item visibility follows
// web's `getActions` exactly: promote,
// demote, mute, unmute, report, unreport, ban, remove — with the same
// conditions (mute vs unmute by the member's mute state; report vs unreport by
// whether the viewer has flagged them). Web's `ConfirmProvider` maps to the
// native `Alert.alert` (the `useFailedMessageSheet` pattern), and
// `useNotifications('chat')` to the `useChatNotifications` stub. Live SDK calls
// are gated on `useAuth().isConnected`. Web resolves `isFlaggedByMe` lazily when
// the menu opens (`queryIsFlaggedByMe`); RN resolves it once per row via
// `UserRepository.isUserFlaggedByMe` (the visibility condition is what matters).

// 1. React / RN imports
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, View } from 'react-native';

// 2. Third-party imports
import {
  ChannelRepository,
  UserRepository,
} from '@amityco/ts-sdk-react-native';

// 3. Internal imports
import { Menu } from '../../../../../core/design/components/Menu';
import { type AmityIconName } from '../../../../../core/design/icons';
import { resolveString } from '../../../../../core/localization';
import { MemberRoles } from '../../../../../core/constants';
import useAuth from '../../../../../core/hooks/useAuth';
import { useBottomSheet } from '../../../../../core/stores/slices/bottomSheetSlice';
import { useChatNotifications } from '../../hooks/useChatNotifications';
import { useStyles } from './styles';

// 4. Types
type TriggerArgs = {
  isOpen: boolean;
  isDesktop: boolean;
  openPopover: () => void;
  closePopover: () => void;
};

type AmityGroupMemberActionComponentProps = {
  /** Trigger render-prop (RN equivalent of web's `anchor`); wire the row's
   *  ellipsis onPress to `openPopover`. */
  anchor: (args: TriggerArgs) => ReactNode;
  channelId: string;
  user: Amity.InternalUser;
  isMemberModerator: boolean;
  isViewerModerator: boolean;
  isMuted?: boolean;
};

type ActionItem = {
  key: string;
  icon: AmityIconName;
  label: string;
  destructive?: boolean;
  onPress: () => void;
  visible: boolean;
};

// 5. Named function component
export function AmityGroupMemberActionComponent({
  anchor,
  channelId,
  user,
  isMemberModerator,
  isViewerModerator,
  isMuted = false,
}: AmityGroupMemberActionComponentProps) {
  const { styles } = useStyles();
  const { isConnected } = useAuth();
  const { success } = useChatNotifications();
  const { openBottomSheet, closeBottomSheet, bottomSheetHeight } =
    useBottomSheet();

  const userId = user.userId;

  const [isFlaggedByMe, setIsFlaggedByMe] = useState(false);

  useEffect(() => {
    if (!isConnected) return undefined;
    let active = true;
    UserRepository.isUserFlaggedByMe(userId)
      .then((flagged) => {
        if (active) setIsFlaggedByMe(!!flagged);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isConnected, userId]);

  function confirmAlert(
    title: string,
    message: string,
    confirmLabel: string,
    destructive: boolean,
    onConfirm: () => void
  ) {
    Alert.alert(title, message, [
      { text: resolveString('amity_chat_cancel'), style: 'cancel' },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]);
  }

  async function handlePromote() {
    if (!isConnected) return;
    await ChannelRepository.Moderation.addRole(
      channelId,
      MemberRoles.CHANNEL_MODERATOR,
      [userId]
    );
    success({
      content: resolveString('amity_chat_group_member_list_toast_promoted'),
    });
  }

  async function handleDemote() {
    if (!isConnected) return;
    await ChannelRepository.Moderation.removeRole(
      channelId,
      MemberRoles.CHANNEL_MODERATOR,
      [userId]
    );
    success({
      content: resolveString('amity_chat_group_member_list_toast_demoted'),
    });
  }

  async function handleBan() {
    if (!isConnected) return;
    await ChannelRepository.Moderation.banMembers(channelId, [userId]);
    success({
      content: resolveString('amity_chat_group_member_list_toast_banned'),
    });
  }

  async function handleRemove() {
    if (!isConnected) return;
    await ChannelRepository.Membership.removeMembers(channelId, [userId]);
    success({ content: resolveString('amity_chat_action_remove_member') });
  }

  async function handleMute() {
    if (!isConnected) return;
    await ChannelRepository.Moderation.muteMembers(channelId, [userId]);
    success({ content: resolveString('amity_chat_action_mute_user') });
  }

  async function handleUnmute() {
    if (!isConnected) return;
    await ChannelRepository.Moderation.unmuteMembers(channelId, [userId]);
    success({ content: resolveString('amity_chat_action_unmute_user') });
  }

  async function handleReport() {
    if (!isConnected) return;
    await UserRepository.flagUser(userId);
    setIsFlaggedByMe(true);
    success({
      content: resolveString('amity_chat_action_report_user_success'),
    });
  }

  async function handleUnreport() {
    if (!isConnected) return;
    await UserRepository.unflagUser(userId);
    setIsFlaggedByMe(false);
    success({
      content: resolveString('amity_chat_action_unreport_user_success'),
    });
  }

  const items: ActionItem[] = [
    {
      key: 'promote',
      icon: 'user-shield-r',
      label: resolveString('amity_chat_member_action_promote'),
      visible: isViewerModerator && !isMemberModerator,
      onPress: () =>
        confirmAlert(
          resolveString('amity_chat_group_member_list_promote_title'),
          resolveString('amity_chat_group_member_list_promote_message'),
          resolveString('amity_chat_group_member_list_promote_confirm'),
          false,
          handlePromote
        ),
    },
    {
      key: 'demote',
      icon: 'user-shield-r',
      label: resolveString('amity_chat_member_action_demote'),
      visible: isViewerModerator && isMemberModerator,
      onPress: () =>
        confirmAlert(
          resolveString('amity_chat_group_member_list_demote_title'),
          resolveString('amity_chat_group_member_list_demote_message'),
          resolveString('amity_chat_group_member_list_demote_confirm'),
          true,
          handleDemote
        ),
    },
    {
      key: 'mute',
      icon: 'volume-slash-r',
      label: resolveString('amity_chat_group_member_action_mute'),
      visible: isViewerModerator && !isMuted && !isMemberModerator,
      onPress: () =>
        confirmAlert(
          resolveString('amity_chat_mute_confirm_title'),
          resolveString('amity_chat_mute_confirm_message'),
          resolveString('amity_chat_mute_confirm_label'),
          true,
          handleMute
        ),
    },
    {
      key: 'unmute',
      icon: 'volume-s',
      label: resolveString('amity_chat_group_member_action_unmute'),
      visible: isViewerModerator && isMuted && !isMemberModerator,
      onPress: () =>
        confirmAlert(
          resolveString('amity_chat_unmute_confirm_title'),
          resolveString('amity_chat_unmute_confirm_message'),
          resolveString('amity_chat_unmute_confirm_label'),
          false,
          handleUnmute
        ),
    },
    {
      key: 'report',
      icon: 'flag-r',
      label: resolveString('amity_chat_member_action_report'),
      visible: !isFlaggedByMe,
      onPress: handleReport,
    },
    {
      key: 'unreport',
      // LEADS WEB (PDT-4143): web PR 1822 gave the slashed flag to the message
      // menu and the 1:1 conversation menu but missed this third site — its
      // MemberList still renders `icon: Flag` for both report and unreport.
      // Same intent applies here, so RN uses flag-slash-r; drop this marker once
      // web's member list catches up.
      icon: 'flag-slash-r',
      label: resolveString('amity_chat_member_action_unreport'),
      visible: isFlaggedByMe,
      onPress: handleUnreport,
    },
    {
      key: 'ban',
      icon: 'ban-r',
      label: resolveString('amity_chat_user_action_ban'),
      visible: isViewerModerator,
      onPress: () =>
        confirmAlert(
          resolveString('amity_chat_ban_confirm_title'),
          resolveString('amity_chat_ban_confirm_message'),
          resolveString('amity_chat_ban_confirm_label'),
          true,
          handleBan
        ),
    },
    {
      key: 'remove',
      icon: 'trash-r',
      label: resolveString('amity_chat_member_action_remove'),
      destructive: true,
      visible: isViewerModerator,
      onPress: () =>
        confirmAlert(
          resolveString('amity_chat_group_member_list_remove_title'),
          resolveString('amity_chat_group_member_list_remove_message'),
          resolveString('amity_chat_group_member_list_remove_confirm'),
          true,
          handleRemove
        ),
    },
  ];

  const visibleItems = items.filter((item) => item.visible);

  if (visibleItems.length === 0) {
    return (
      <>
        {anchor({
          isOpen: false,
          isDesktop: true,
          openPopover: () => {},
          closePopover: () => {},
        })}
      </>
    );
  }

  // Member actions render in the global bottom sheet (RN mobile adaptation —
  // web uses a desktop popover). The row's ellipsis still triggers via the
  // `anchor` render-prop; its `openPopover` now opens the sheet.
  function openActionSheet() {
    openBottomSheet({
      height:
        bottomSheetHeight[
          visibleItems.length as keyof typeof bottomSheetHeight
        ],
      content: (
        <View style={styles.sheetContainer}>
          <Menu variant="chat" container="drawer">
            {visibleItems.map((item) => (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                label={item.label}
                destructive={item.destructive}
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
    <>
      {anchor({
        isOpen: false,
        isDesktop: false,
        openPopover: openActionSheet,
        closePopover: closeBottomSheet,
      })}
    </>
  );
}
