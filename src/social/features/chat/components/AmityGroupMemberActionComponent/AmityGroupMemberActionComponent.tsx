// AmityGroupMemberActionComponent — RN port of the member long-press action menu
// that AmityUiKitWeb builds inline in `group/members/components/MemberList`
// (`getActions`) and renders through its `ActionMenu`.
//
// Mirrors the sibling `AmityMessageActionMenu` (Popover + Menu + `anchor`
// render-prop): the owning MemberItem row wires the trailing ellipsis to
// `openPopover`. Item visibility follows web's `getActions`; per the
// AmityMessageActionMenu precedent this batch keeps the task's curated set
// (promote / demote, ban, remove, report) and drops web's mute/unmute and the
// unreport toggle. Web's `ConfirmProvider` maps to the native `Alert.alert`
// (the `useFailedMessageSheet` pattern), and `useNotifications('chat')` to the
// `useChatNotifications` stub. Live SDK calls are gated on `useAuth().isConnected`.

// 1. React / RN imports
import { type ReactNode } from 'react';
import { Alert, View } from 'react-native';

// 2. Third-party imports
import {
  ChannelRepository,
  UserRepository,
} from '@amityco/ts-sdk-react-native';

// 3. Internal imports
import { Menu } from '../../../../../core/design/components/Menu';
import {
  Popover,
  type PopoverPlacement,
} from '../../../../../core/design/components/Popover';
import { type AmityIconName } from '../../../../../core/design/icons';
import { resolveString } from '../../../../../core/localization';
import { MemberRoles } from '../../../../../core/constants';
import useAuth from '../../../../../core/hooks/useAuth';
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
  placement?: PopoverPlacement;
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
  placement = 'bottom right',
}: AmityGroupMemberActionComponentProps) {
  const { styles } = useStyles();
  const { isConnected } = useAuth();
  const { success } = useChatNotifications();

  const userId = user.userId;

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

  async function handleReport() {
    if (!isConnected) return;
    await UserRepository.flagUser(userId);
    success({
      content: resolveString('amity_chat_action_report_user_success'),
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
      key: 'report',
      icon: 'flag-r',
      label: resolveString('amity_chat_member_action_report'),
      visible: true,
      onPress: handleReport,
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

  return (
    <Popover trigger={anchor} placement={placement}>
      {({ closePopover }) => (
        <View style={styles.menuContainer}>
          <Menu variant="chat" container="popover">
            {visibleItems.map((item) => (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                label={item.label}
                destructive={item.destructive}
                typography="body"
                onPress={() => {
                  closePopover();
                  item.onPress();
                }}
              />
            ))}
          </Menu>
        </View>
      )}
    </Popover>
  );
}
