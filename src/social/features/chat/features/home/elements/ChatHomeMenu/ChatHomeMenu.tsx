// ChatHomeMenu — the "⋯" chat-home overflow menu, ported from AmityUiKitWeb
// v4/chat/features/home/elements/ChatHomeMenu.
//
// Behaviour (mirrors web): a filled ellipsis icon button opens a Popover with a
// single "Archived" Menu.Item that navigates to the archived-chats page.
//
// RN adaptations from web:
//   - Web `Button.Icon` (EllipsisV, filled/secondary, size 32) → a Pressable +
//     AmityIcon on a filled surface (same pattern as CreateChatMenu).
//   - Web `useChatNavigation().push({ type: ChatPageTypes.ArchivedChatPage })` →
//     React Navigation. The `AmityArchivedChatPage` route lives in the
//     orchestrator-owned RouteParamList, so the nav prop is typed `any` (as in
//     AmityChatHomePage) to avoid coupling this file to the param list.
//   - Web `forceShowPopUp` is a web-only positioning flag with no RN equivalent.

// 1. React / RN imports
import { Pressable } from 'react-native';

// 2. Third-party imports
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import { Popover } from '../../../../../../../core/design/components/Popover';
import { Menu } from '../../../../../../../core/design/components/Menu';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import { useStyles } from './styles';

// The filled "⋯" trigger button (module-scope so it is not re-created per render).
type MenuButtonProps = {
  accessibilityLabel: string;
  isOpen?: boolean;
  onPress?: () => void;
};

function MenuButton({ accessibilityLabel, isOpen, onPress }: MenuButtonProps) {
  const { styles } = useStyles();
  return (
    <Pressable
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ expanded: isOpen }}
      onPress={onPress}
    >
      <AmityIcon
        name="ellipsis-v-r"
        size={24}
        tokenColor={AmityColorToken.IconIconButtonFilledSecondaryDefault}
      />
    </Pressable>
  );
}

// 4. Named function component
export function ChatHomeMenu() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const archivedLabel = useString('amity_chat_archived');

  return (
    <Popover
      placement="bottom right"
      // eslint-disable-next-line react/no-unstable-nested-components -- Popover's trigger is a render-prop, not a component definition.
      trigger={({ openPopover, isOpen }) => (
        <MenuButton
          accessibilityLabel="Chat menu"
          isOpen={isOpen}
          onPress={openPopover}
        />
      )}
    >
      {({ closePopover }) => (
        <Menu container="popover">
          <Menu.Item
            icon="arhive-r"
            label={archivedLabel}
            typography="body"
            onPress={() => {
              closePopover();
              navigation.navigate('AmityArchivedChatPage');
            }}
          />
        </Menu>
      )}
    </Popover>
  );
}
