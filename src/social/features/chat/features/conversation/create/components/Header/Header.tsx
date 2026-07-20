// Header — create-conversation header, ported from AmityUiKitWeb
// v4/chat/features/conversation/create/components/Header. Composes the shared
// TopBar (close variant) over a search field.
//
// RN adaptations from web:
//   - Web's `SearchInput` molecule → the `Boxed` input atom (pill) with a
//     leading search glyph tinted via the Icon/Input/TextInput token.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { TopBar } from '../../../../../elements/TopBar';
import { Boxed } from '../../../../../../../../core/design/atoms/Input';
import { AmityIcon } from '../../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type HeaderProps = {
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

// 4. Named function component
export function Header({ onClose, searchValue, onSearchChange }: HeaderProps) {
  const { styles } = useStyles();
  const title = useString('amity_chat_create_conversation_title');
  const searchPlaceholder = useString('amity_chat_search_placeholder');

  return (
    <View style={styles.header}>
      <TopBar title={title} leadingType="close" onLeading={onClose} />
      <View style={styles.searchBar}>
        <Boxed
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          accessibilityLabel={searchPlaceholder}
          leadingIcon={
            <AmityIcon
              name="search-l"
              size={20}
              tokenColor={AmityColorToken.IconInputTextInputDefault}
            />
          }
        />
      </View>
    </View>
  );
}
