// AmityConversationChatUserActionComponent — RN port of the 1-1 conversation
// user action menu that AmityUiKitWeb builds in
// `conversation/chat/hooks/useConversationActions` (block / report / notification).
//
// Mirrors the sibling `AmityMessageActionMenu` (Popover + Menu + `anchor`
// render-prop): the conversation Header wires its trailing button to
// `openPopover`. Per the task's curated set this keeps block + report and drops
// the notification toggle. `isBlockedByMe` is read live from
// `UserRepository.Relationship.getFollowInfo` (`status === 'blocked'`) so the
// block/unblock label is always correct; report is a single flag action. Web's
// `ConfirmProvider` maps to the native `Alert.alert` and
// `useNotifications('chat')` to the `useChatNotifications` stub. SDK calls are
// gated on `useAuth().isConnected`.

// 1. React / RN imports
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, View } from 'react-native';

// 2. Third-party imports
import { UserRepository } from '@amityco/ts-sdk-react-native';

// 3. Internal imports
import { Menu } from '../../../../../core/design/components/Menu';
import {
  Popover,
  type PopoverPlacement,
} from '../../../../../core/design/components/Popover';
import { type AmityIconName } from '../../../../../core/design/icons';
import { resolveString } from '../../../../../core/localization';
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

type AmityConversationChatUserActionComponentProps = {
  /** Trigger render-prop (RN equivalent of web's `anchor`); wire the header
   *  button onPress to `openPopover`. */
  anchor: (args: TriggerArgs) => ReactNode;
  user: Amity.InternalUser;
  placement?: PopoverPlacement;
};

type ActionItem = {
  key: string;
  icon: AmityIconName;
  label: string;
  onPress: () => void;
};

// 5. Named function component
export function AmityConversationChatUserActionComponent({
  anchor,
  user,
  placement = 'bottom right',
}: AmityConversationChatUserActionComponentProps) {
  const { styles } = useStyles();
  const { isConnected } = useAuth();
  const { success } = useChatNotifications();

  const userId = user.userId;
  const displayName = user.displayName ?? user.userId;

  const [isBlockedByMe, setIsBlockedByMe] = useState(false);

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

  return (
    <Popover trigger={anchor} placement={placement}>
      {({ closePopover }) => (
        <View style={styles.menuContainer}>
          <Menu variant="chat" container="popover">
            {items.map((item) => (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                label={item.label}
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
