// YouTile — ported from AmityUiKitWeb features/shared/components/YouTile.
// The "you" selected-member tile: a rounded avatar with a moderator indicator
// badge above a single-line caption label. Web resolves the avatar via
// FileRepository.fileUrlWithSize; RN's useFile already returns a size-scaled
// URL, so avatarFileId is passed through directly (avatarCustomUrl wins when set).
//
// Badge geometry deviates from web (16px chip + 3px ring, inside the frame): the
// design's "You" tile shows the 16px chip with only a hairline ring, centred on
// the avatar's bottom-right edge (see styles.ts).

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Avatar } from '../../../../../core/design/atoms/Avatar';
import { Typography } from '../../../../../core/design/components/Typography';
import { ModeratorBadge } from '../../../../../core/design/elements/ModeratorBadge';
import useFile from '../../../../../core/hooks/useFile';
import { ImageSizeState } from '../../../../../core/enums';
import { resolveString } from '../../../../../core/localization';
import { MODERATOR_BADGE_SIZE, useStyles } from './styles';

// 3. Types
type YouTileProps = {
  user: Amity.User;
  label?: string;
};

// 4. Named function component
export function YouTile({
  user,
  label = resolveString('amity_chat_member_you'),
}: YouTileProps) {
  const { styles } = useStyles();

  const displayName = user.displayName ?? user.userId;
  const initials = displayName.trim().charAt(0).toUpperCase() || '?';
  const resolvedAvatar = useFile({
    fileId: user.avatarFileId ?? '',
    imageSize: ImageSizeState.small,
  });
  const imageUrl = user.avatarCustomUrl ?? resolvedAvatar;

  return (
    <View style={styles.tile}>
      <Avatar
        variant={imageUrl ? 'image' : 'text'}
        shape="rounded"
        size={40}
        imageUrl={imageUrl}
        initials={initials}
        indicator={<ModeratorBadge size={MODERATOR_BADGE_SIZE} />}
        indicatorStyle={styles.moderatorBadge}
      />
      <Typography variant="caption" style={styles.name} numberOfLines={1}>
        {label}
      </Typography>
    </View>
  );
}
