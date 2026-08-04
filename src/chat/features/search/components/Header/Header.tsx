// Header — ported from AmityUiKitWeb v4/chat/features/search/components/Header.
// The chat-search top bar: a flexible SearchInput plus a trailing "Cancel" button.
//
// RN adaptations from web:
//   - Web `Button.Main styleType="ghost" hierarchy="primary" size="sm"` → the RN
//     Button atom with `hierarchy="tertiary"` (the ghost/primary text variant),
//     matching the edit-group-profile header.
//   - Web CSS `position: sticky` is inherent to RN's non-scrolling header row.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Button } from '../../../../../core/design/atoms/Button';
import { SearchInput } from '../../../../../core/design/molecules/SearchInput';
import { useString } from '../../../../../core/localization';
import { SEARCH_MAX_QUERY_LENGTH } from '../../../../constants';
import { useStyles } from './styles';

// 3. Types
type HeaderProps = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  onClear: () => void;
  onCancel: () => void;
};

// 4. Named function component
export function Header({
  searchText,
  onSearchTextChange,
  onClear,
  onCancel,
}: HeaderProps) {
  const { styles } = useStyles();
  const placeholder = useString('amity_chat_search_placeholder');
  const cancelLabel = useString('amity_chat_cancel');

  return (
    <View style={styles.header}>
      <View style={styles.input}>
        <SearchInput
          value={searchText}
          onChange={onSearchTextChange}
          onClear={onClear}
          placeholder={placeholder}
          accessibilityLabel={placeholder}
          maxLength={SEARCH_MAX_QUERY_LENGTH}
        />
      </View>
      <Button
        hierarchy="tertiary"
        tone="default"
        size="sm"
        label={cancelLabel}
        style={styles.cancel}
        onPress={onCancel}
      />
    </View>
  );
}
