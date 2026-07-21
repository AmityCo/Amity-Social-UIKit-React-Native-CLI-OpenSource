// SearchButton — the chat-home search header button, ported from AmityUiKitWeb
// v4/chat/features/home/elements/SearchButton.
//
// Behaviour (mirrors web): a filled secondary icon button that navigates to the
// SearchChannelPage.
//
// RN adaptations from web:
//   - Web `Button.Icon icon={<Search />} styleType="filled" hierarchy="secondary"
//     size={32}` → a Pressable + AmityIcon on a filled secondary surface (the
//     same construction as the home CreateChatMenu "+" button). The web `Search`
//     icon's default (Regular) variant byte-matches the `search-r` registry glyph.
//   - Web `useChatNavigation().push(SearchChannelPage)` → React Navigation
//     `navigate('AmitySearchChannelPage')`.

// 1. React / RN imports
import { Pressable } from 'react-native';

// 2. Third-party imports
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 3. Internal imports (relative)
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import type { RootStackParamList } from '../../../../../../../core/routes/RouteParamList';
import { useStyles } from './styles';

// The SearchChannelPage route is registered by the orchestrator in the navigator
// + RouteParamList (both DO NOT TOUCH here). We extend the param-list type locally
// with the destination so this button type-checks ahead of that wiring.
type SearchStackParamList = RootStackParamList & {
  AmitySearchChannelPage: undefined;
};

// 4. Named function component
export function SearchButton() {
  const { styles } = useStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const ariaLabel = useString('amity_chat_search_placeholder');

  return (
    <Pressable
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      onPress={() => navigation.navigate('AmitySearchChannelPage')}
    >
      <AmityIcon
        name="search-r"
        size={24}
        tokenColor={AmityColorToken.IconIconButtonFilledSecondaryDefault}
      />
    </Pressable>
  );
}
