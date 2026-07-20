// EmptyState — ported from AmityUiKitWeb features/shared/components/EmptyState.
// A centered icon + title for the various chat empty/prompt states. Web icons
// (Search.Light / SearchCross / ListRadio / Inbox) map to the SoT icon registry.
// The `min-height: calc(100svh - …)` fill → flex:1 (no svh in RN).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import {
  AmityIcon,
  type AmityIconName,
} from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type EmptyStateVariant =
  | 'prompt'
  | 'no-results'
  | 'no-members'
  | 'no-banned-users'
  | 'no-archived-chats';

type EmptyStateProps = {
  variant: EmptyStateVariant;
};

function getIconName(variant: EmptyStateVariant): AmityIconName {
  if (variant === 'prompt') return 'search-l';
  if (variant === 'no-banned-users') return 'list-radio-l';
  if (variant === 'no-archived-chats') return 'inbox-l';
  return 'search-cross-l';
}

// 4. Named function component
export function EmptyState({ variant }: EmptyStateProps) {
  const { styles } = useStyles();

  // Resolved unconditionally (matches web) to respect rules-of-hooks.
  const content: Record<EmptyStateVariant, string> = {
    'prompt': useString('amity_chat_search_min_chars'),
    'no-results': useString('amity_chat_search_no_results'),
    'no-members': useString('amity_chat_no_members_found'),
    'no-banned-users': useString('amity_chat_banned_members_empty'),
    'no-archived-chats': useString('amity_chat_archived_empty_title'),
  };

  return (
    <View style={styles.emptyState}>
      <AmityIcon
        name={getIconName(variant)}
        size={64}
        tokenColor={AmityColorToken.IconEmptyStateIconDefault}
      />
      <Typography variant="titleBold" style={styles.text}>
        {content[variant]}
      </Typography>
    </View>
  );
}
