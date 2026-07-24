// Header — create-conversation header, ported from AmityUiKitWeb
// v4/chat/features/conversation/create/components/Header. Composes the shared
// TopBar (close variant) over the SearchInput molecule — the same search field
// web uses here, and the one every other chat search header uses in RN (leading
// search glyph + clear button), so the style matches across the UIKit.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { TopBar } from '../../../../../elements/TopBar';
import { SearchInput } from '../../../../../../../../core/design/molecules/SearchInput';
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
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          accessibilityLabel={searchPlaceholder}
        />
      </View>
    </View>
  );
}
