// AmityMessageActionMenu — RN port of AmityUiKitWeb
// chat/features/shared/components/MessageActionsPopover. The long-press action
// menu (Reply / Copy / Edit / Delete / Report / Save).
//
// Web's popover is externally controlled via `anchor: HTMLElement`; the RN
// Wave-A Popover is self-controlled through a `trigger` render-prop, so this
// menu takes that render-prop as `anchor` and the owning MessageRow wires
// `onLongPress → openPopover`.
//
// The report/unreport toggle is query-driven, matching web MessageActionsPopover:
// this menu calls useFlagMessageQuery (isMessageFlaggedByMe) — gated on the menu
// being open so it doesn't fire for every message in the list — and swaps `report`
// for `unreport` once the answer is known. Both items stay hidden while the flag
// state is loading (web gates on `!flagState.isLoading`) so a reported message
// never briefly shows "Report". Unreport calls the query's `unreport` then
// refetches; the report screen (ContentReportReason) invalidates the same query
// key so reopening the menu reflects the new state. Item visibility follows web.

// 1. React / RN imports
import { useState, type ReactNode } from 'react';
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
import { ReactionPicker } from '../../elements/ReactionPicker';
import { useMessageReactions } from '../../features/shared/hooks/useMessageReactions';
import { useFlagMessageQuery } from '../../hooks/queries';
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
  isFlaggedByMe = false,
  // While the flag state is still being fetched neither Report nor Unreport is
  // shown (web gates both on `!flagState.isLoading`) — otherwise the menu would
  // flash "Report" on a message that turns out to be already reported.
  isFlagLoading = false
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
      // Regular (outline), matching web develop's <ShareLeft/> in the action menu.
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
      // Web: `!isOwn && !flagState.isLoading && isFlaggedByMe` (no isActive gate).
      visible: !isOwn && !isFlagLoading && isFlaggedByMe,
    },
    {
      key: 'report',
      icon: 'flag-r',
      label: resolveString('amity_chat_option_report'),
      onPress: () => handlers.onReport(message),
      // Web: `!isOwn && !flagState.isLoading && !isFlaggedByMe`.
      visible: !isOwn && !isFlagLoading && !isFlaggedByMe,
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
  viewerIsMutedInChannel = false,
  placement = 'bottom right',
}: AmityMessageActionMenuProps) {
  const { styles } = useStyles();
  const { selectReaction } = useMessageReactions();

  const isOwn = !!currentUserId && message.creatorId === currentUserId;

  // Web MessageActionsPopover queries "have I reported this?" to swap
  // Report ↔ Unreport. Gate the query on the menu being open (like web's
  // on-open popover) so we don't fire isMessageFlaggedByMe for every message in
  // the list; only the viewer's own messages are never reportable.
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    isFlaggedByMe,
    isLoading: isFlagLoading,
    unreport,
    refetch: refetchFlag,
  } = useFlagMessageQuery({
    messageId: message.messageId,
    enabled: menuOpen && !isOwn,
  });

  // Web MessageActionsPopover renders a ReactionPicker above the menu for active
  // (synced, non-deleted) messages; myReaction = first of message.myReactions.
  const isActive =
    message.syncState === ('synced' as Amity.SyncState) &&
    message.isDeleted !== true;
  const myReaction =
    ((message.myReactions?.[0] as string | undefined) ?? null) || null;

  const copyText = () => {
    const text = (message as Amity.Message<'text'>).data?.text ?? '';
    if (text) Clipboard.setString(text);
    handlers.onCopy();
  };

  // Inject the unreport handler (web wires it from the same flag query); refetch
  // afterwards so the menu returns to Report.
  const menuHandlers: MessageActionHandlers = {
    ...handlers,
    onUnreport: () => unreport({ onSuccess: refetchFlag }),
  };

  const items = buildMessageActionItems(
    message,
    currentUserId,
    menuHandlers,
    copyText,
    viewerIsMutedInChannel,
    isFlaggedByMe,
    isFlagLoading
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
    <Popover
      trigger={anchor}
      placement={placement}
      surface={false}
      onOpen={() => setMenuOpen(true)}
      onClose={() => setMenuOpen(false)}
    >
      {({ closePopover }) => (
        <View style={styles.content}>
          {isActive && (
            <View style={styles.pickerCard}>
              <ReactionPicker
                myReaction={myReaction}
                onReactionClick={(reactionName) => {
                  selectReaction({ message, reactionName });
                  closePopover();
                }}
              />
            </View>
          )}
          <View style={styles.menuCard}>
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
        </View>
      )}
    </Popover>
  );
}
