// CreateChatMenu — the "+" new-chat header button, ported from AmityUiKitWeb
// v4/chat/features/home/elements/CreateChatMenu.
//
// Behaviour (mirrors web): when only one channel type is enabled it is a single
// filled icon button; when both `conversation` and `community` are enabled it
// opens a Popover with a "New chat" / "New group" Menu.
//
// RN adaptations from web:
//   - Web reads enabled types from `useChatFeatureFlags`; RN has no such hook
//     yet, so the enabled types come in as a prop (defaulting to conversation
//     only). The web `useChatNavigation().push` → React Navigation.
//   - There is no RN `SelectGroupMemberPage` route yet, so the group action is
//     delegated to an optional `onNewGroup` callback rather than navigating.
//   - Web `Button.Icon` (filled/secondary) → a Pressable + AmityIcon on a filled
//     surface, tinted via the Icon/IconButton/Filled/Secondary token.

// 1. React / RN imports
import { Pressable } from 'react-native';

// 2. Third-party imports
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import { Popover } from '../../../../../core/design/components/Popover';
import { Menu } from '../../../../../core/design/components/Menu';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import type { RootStackParamList } from '../../../../../core/routes/RouteParamList';
import { useStyles } from './styles';

// 4. Types
type CreateChatMenuProps = {
  /** Channel types the chat feature exposes. Defaults to conversation only. */
  enabledChannelTypes?: Amity.ChannelType[];
  /** Invoked for the "New group" action (no RN group-create route exists yet). */
  onNewGroup?: () => void;
};

// The filled "+" trigger button (module-scope so it is not re-created per render).
type PlusButtonProps = {
  accessibilityLabel: string;
  onPress?: () => void;
};

function PlusButton({ accessibilityLabel, onPress }: PlusButtonProps) {
  const { styles } = useStyles();
  return (
    <Pressable
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      <AmityIcon
        name="plus-r"
        size={24}
        tokenColor={AmityColorToken.IconIconButtonFilledSecondaryDefault}
      />
    </Pressable>
  );
}

// 5. Named function component
export function CreateChatMenu({
  enabledChannelTypes = ['conversation'],
  onNewGroup,
}: CreateChatMenuProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const createAriaLabel = useString('amity_chat_create_new_chat');
  const directLabel = useString('amity_chat_create_direct');
  const groupLabel = useString('amity_chat_create_group');

  const hasConversation = enabledChannelTypes.includes('conversation');
  const hasCommunity = enabledChannelTypes.includes('community');
  const showBoth = hasConversation && hasCommunity;

  const goToCreateConversation = () =>
    navigation.navigate('AmityChannelCreateConversationPage');
  // Group creation starts at member selection; callers may override via onNewGroup.
  const goToNewGroup =
    onNewGroup ?? (() => navigation.navigate('AmitySelectGroupMemberPage'));

  if (!showBoth) {
    return (
      <PlusButton
        accessibilityLabel={createAriaLabel}
        onPress={hasConversation ? goToCreateConversation : goToNewGroup}
      />
    );
  }

  return (
    <Popover
      placement="bottom right"
      // eslint-disable-next-line react/no-unstable-nested-components -- Popover's trigger is a render-prop, not a component definition.
      trigger={({ openPopover }) => (
        <PlusButton
          accessibilityLabel={createAriaLabel}
          onPress={openPopover}
        />
      )}
    >
      {({ closePopover }) => (
        <Menu container="popover">
          <Menu.Item
            icon="user-plus-r"
            label={directLabel}
            typography="body"
            onPress={() => {
              closePopover();
              goToCreateConversation();
            }}
          />
          <Menu.Item
            icon="user-group-r"
            label={groupLabel}
            typography="body"
            onPress={() => {
              closePopover();
              goToNewGroup();
            }}
          />
        </Menu>
      )}
    </Popover>
  );
}
