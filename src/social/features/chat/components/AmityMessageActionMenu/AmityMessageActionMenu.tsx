// AmityMessageActionMenu — RN port of AmityUiKitWeb
// chat/features/shared/components/MessageActionsPopover. The long-press action
// menu (Reply / Copy / Edit / Delete / Report / Save).
//
// Web's popover is externally controlled via `anchor: HTMLElement`; the RN
// Wave-A Popover is self-controlled through a `trigger` render-prop, so this
// menu takes that render-prop as `anchor` and the owning MessageRow wires
// `onLongPress → openPopover`. Web's ReactionPicker and flag-query loading
// skeleton are dropped (reaction row deferred to M4; RN has no flag-loading infra).
// The report/unreport toggle IS ported: `isFlaggedByMe` (prop-driven — RN has no
// flag query yet, so the wiring layer supplies it) swaps `report` for `unreport`,
// matching web `buildBubbleMenuItems`. Item visibility otherwise follows web.

// 1. React / RN imports
import { type ReactNode } from 'react';
import { View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

// 2. Internal imports
import { Menu } from '../../../../../core/design/components/Menu';
import {
  Popover,
  type PopoverPlacement,
} from '../../../../../core/design/components/Popover';
import { type AmityIconName } from '../../../../../core/design/icons';
import { resolveString } from '../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
export type MessageActionHandlers = {
  onEdit: () => void;
  onReply: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onSave: () => void;
  onReport: (message: Amity.Message) => void;
  /** Un-flag a message the viewer previously reported (shown when isFlaggedByMe). */
  onUnreport?: () => void;
};

type TriggerArgs = {
  isOpen: boolean;
  isDesktop: boolean;
  openPopover: () => void;
  closePopover: () => void;
};

type AmityMessageActionMenuProps = {
  /** Trigger render-prop (RN equivalent of web's `anchor`); wire long-press to `openPopover`. */
  anchor: (args: TriggerArgs) => ReactNode;
  message: Amity.Message;
  currentUserId?: string | null;
  handlers: MessageActionHandlers;
  /** Whether the viewer has already reported this message (swaps report→unreport). */
  isFlaggedByMe?: boolean;
  viewerIsMutedInChannel?: boolean;
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

const MUTED_VICTIM_TRIMMED_KEYS = new Set([
  'edit',
  'reply',
  'report',
  'unreport',
]);

export function buildMessageActionItems(
  message: Amity.Message,
  currentUserId: string | null | undefined,
  handlers: MessageActionHandlers,
  onCopyText: () => void,
  viewerIsMutedInChannel = false,
  isFlaggedByMe = false
): Omit<ActionItem, 'visible'>[] {
  const isOwn = !!currentUserId && message.creatorId === currentUserId;
  const isText = message.dataType === 'text';
  const isCustom = message.dataType === 'custom';
  const isImage = message.dataType === 'image';
  const isVideo = message.dataType === 'video';
  const isSynced = message.syncState === ('synced' as Amity.SyncState);
  const isDeleted = message.isDeleted === true;
  const isActive = isSynced && !isDeleted;

  const items: ActionItem[] = [
    {
      key: 'edit',
      icon: 'pen-r',
      label: resolveString('amity_chat_option_edit'),
      onPress: handlers.onEdit,
      visible: isOwn && isText && isActive,
    },
    {
      key: 'reply',
      icon: 'share-left-r',
      label: resolveString('amity_chat_option_reply'),
      onPress: handlers.onReply,
      visible: isActive,
    },
    {
      key: 'copy',
      icon: 'copy-r',
      label: resolveString('amity_chat_option_copy'),
      onPress: onCopyText,
      visible: (isText || isCustom) && isActive,
    },
    {
      key: 'save',
      icon: 'arrow-down-to-bracket-r',
      label: resolveString('amity_chat_action_save'),
      onPress: handlers.onSave,
      visible: (isImage || isVideo) && isActive,
    },
    {
      key: 'unreport',
      icon: 'flag-r',
      label: resolveString('amity_chat_option_unreport'),
      onPress: () => handlers.onUnreport?.(),
      visible: !isOwn && isActive && isFlaggedByMe,
    },
    {
      key: 'report',
      icon: 'flag-r',
      label: resolveString('amity_chat_option_report'),
      onPress: () => handlers.onReport(message),
      visible: !isOwn && isActive && !isFlaggedByMe,
    },
    {
      key: 'delete',
      icon: 'trash-r',
      label: resolveString('amity_chat_option_delete'),
      destructive: true,
      onPress: handlers.onDelete,
      visible: isOwn && isActive,
    },
  ];

  const visible = items.filter((item) => item.visible);
  const trimmed = viewerIsMutedInChannel
    ? visible.filter((item) => !MUTED_VICTIM_TRIMMED_KEYS.has(item.key))
    : visible;
  return trimmed.map(({ visible: _visible, ...rest }) => rest);
}

// 4. Named function component
export function AmityMessageActionMenu({
  anchor,
  message,
  currentUserId,
  handlers,
  isFlaggedByMe = false,
  viewerIsMutedInChannel = false,
  placement = 'bottom right',
}: AmityMessageActionMenuProps) {
  const { styles } = useStyles();

  const copyText = () => {
    const text = (message as Amity.Message<'text'>).data?.text ?? '';
    if (text) Clipboard.setString(text);
    handlers.onCopy();
  };

  const items = buildMessageActionItems(
    message,
    currentUserId,
    handlers,
    copyText,
    viewerIsMutedInChannel,
    isFlaggedByMe
  );

  if (items.length === 0) {
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
            {items.map((item) => (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                label={item.label}
                destructive={item.destructive}
                typography="body"
                onPress={() => {
                  item.onPress();
                  closePopover();
                }}
              />
            ))}
          </Menu>
        </View>
      )}
    </Popover>
  );
}
