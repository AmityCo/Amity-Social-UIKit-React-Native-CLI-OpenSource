// BannedEmptyState — ported from AmityUiKitWeb group/chat/components/BannedEmptyState.
// Shown in place of the thread when the viewer is banned from the group.

import { View } from 'react-native';

import { Typography } from '../../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../../core/localization';
import { useStyles } from './styles';

export function BannedEmptyState() {
  const { styles, token } = useStyles();
  const title = useString('amity_chat_error_banned_chat_title');
  const subtitle = useString('amity_chat_error_banned_chat_sub_title');

  return (
    <View style={styles.container}>
      <AmityIcon
        name="comment-exclamation-l"
        size={64}
        color={token(AmityColorToken.IconEmptyStateIconDefault)}
      />
      <View style={styles.text}>
        <Typography variant="titleBold" style={styles.title}>
          {title}
        </Typography>
        <Typography variant="caption" style={styles.subtitle}>
          {subtitle}
        </Typography>
      </View>
    </View>
  );
}
