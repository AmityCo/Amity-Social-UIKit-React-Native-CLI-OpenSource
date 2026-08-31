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
//   - Web `Button.Icon` (react-aria) remove control → RN `Button.Icon` atom.

// 1. React / RN imports
import { View } from 'react-native';

// 2. Internal imports
import { Button } from '../../../../../core/design/atoms/Button';
import { Typography } from '../../../../../core/design/components/Typography';
import useFile from '../../../../../core/hooks/useFile';
import { ImageSizeState } from '../../../../../core/enums';
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
          <Button.Icon
            icon="cross-s"
            styleType="transparent"
            hierarchy="primary"
            size={16}
            style={styles.removeButton}
            onPress={() => onRemove(user.userId)}
            accessibilityLabel={`Remove ${displayName}`}
          />
        ) : null}
      </View>
      <Typography variant="caption" style={styles.name} numberOfLines={1}>
        {displayName}
      </Typography>
    </View>
  );
}
