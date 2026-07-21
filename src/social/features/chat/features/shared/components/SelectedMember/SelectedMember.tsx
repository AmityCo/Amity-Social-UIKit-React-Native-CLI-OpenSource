// SelectedMember — ported from AmityUiKitWeb chat/features/shared/components/
// SelectedMember. A compact tile for a chosen member: rounded avatar with a
// top-right remove button, and the display name underneath (single line,
// ellipsised).
//
// RN adaptations from web:
//   - Web resolved the avatar via `FileRepository.fileUrlWithSize(user.avatar.fileUrl)`;
//     RN resolves `user.avatarFileId` through `useFile` (small size), mirroring
//     NewMessageNotification. The core Avatar atom is replaced by the chat
//     `Avatar.User` element (rounded, initials fallback).
//   - Web `Button.Icon` (react-aria) remove control → RN `Pressable` + AmityIcon.

// 1. React / RN imports
import { Pressable, View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../core/design/tokens/amity-color-tokens';
import useFile from '../../../../../../../core/hooks/useFile';
import { ImageSizeState } from '../../../../../../../core/enums';
import { Avatar } from '../../../../elements/Avatar';
import { useStyles } from './styles';

// 3. Types
export type SelectedMemberProps = {
  user: Amity.User;
  onRemove?: (userId: string) => void;
};

// 4. Named function component
export function SelectedMember({ user, onRemove }: SelectedMemberProps) {
  const { styles } = useStyles();

  const displayName = user.displayName ?? user.userId;
  const avatarUrl = useFile({
    fileId: user.avatarFileId ?? '',
    imageSize: ImageSizeState.small,
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Avatar.User
          avatarUrl={avatarUrl}
          displayName={displayName}
          size="md"
        />
        {onRemove ? (
          <Pressable
            style={styles.removeButton}
            onPress={() => onRemove(user.userId)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${displayName}`}
          >
            <AmityIcon
              name="cross-s"
              size={16}
              tokenColor={
                AmityColorToken.IconIconButtonTransparentPrimaryDefault
              }
            />
          </Pressable>
        ) : null}
      </View>
      <Typography variant="caption" style={styles.name} numberOfLines={1}>
        {displayName}
      </Typography>
    </View>
  );
}
