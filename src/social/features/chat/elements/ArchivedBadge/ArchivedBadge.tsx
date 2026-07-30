// ArchivedBadge element — ported from AmityUiKitWeb chat/elements/ArchivedBadge.
// A pill-shaped semantic badge (archive glyph + "Archived" label) for chat channels.

import { View } from 'react-native';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { Typography } from '../../../../../core/design/components/Typography';
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

export function ArchivedBadge() {
  const { styles } = useStyles();
  const label = useString('amity_chat_archived_badge_label');

  return (
    <View style={styles.container}>
      <AmityIcon
        name="archive-r"
        size={12}
        tokenColor={AmityColorToken.IconBadgeSemanticBadgeChatArchivedDefault}
      />
      <Typography variant="captionSmall" style={styles.text}>
        {label}
      </Typography>
    </View>
  );
}
