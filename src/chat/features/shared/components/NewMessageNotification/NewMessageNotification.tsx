// NewMessageNotification — ported from AmityUiKitWeb features/shared/components/
// NewMessageNotification. A floating toast pinned to the bottom of the message
// list showing the latest incoming message (avatar + preview text + optional
// media thumbnail) that scrolls to it on press.
//
// RN adaptations from web:
//   - react-aria `Button` → RN `Pressable`.
//   - Web resolved the media thumb via `useFile` + `FileRepository.fileUrlWithSize`;
//     RN `useFile` already returns a size-scaled URL, so it is called with the
//     'small' size directly (avatar/image/video-thumb calls kept unconditional to
//     respect rules-of-hooks, passing '' when not applicable).
//   - Web `<img>` → RN `<Image>`; broken/missing thumb → media-broken icon.
//   - AmityIcon has no `style`; the arrow's 180° rotation lives on a wrapping View.

// 1. React / RN imports
import { Pressable, View, Image } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { resolveString } from '../../../../../core/localization';
import useFile from '../../../../../core/hooks/useFile';
import { ImageSizeState } from '../../../../../core/enums';
import { Avatar } from '../../../../elements/Avatar';
import { useStyles } from './styles';

// 3. Types
type NewMessageNotificationProps = {
  message: Amity.Message;
  onPress: () => void;
};

function getPreviewText(message: Amity.Message): string {
  switch (message.dataType) {
    case 'text':
      return (message.data as { text?: string } | undefined)?.text ?? '';
    case 'image':
      return resolveString('amity_chat_preview_sent_photo');
    case 'video':
      return resolveString('amity_chat_preview_sent_video');
    case 'custom':
      return resolveString('amity_chat_preview_message');
    default:
      return resolveString('amity_chat_preview_message');
  }
}

// 4. Named function component
export function NewMessageNotification({
  message,
  onPress,
}: NewMessageNotificationProps) {
  const { styles } = useStyles();

  const isImage = message.dataType === 'image';
  const isVideo = message.dataType === 'video';
  const imageFileId = isImage
    ? (message.data as { fileId?: string } | undefined)?.fileId ?? ''
    : '';
  const videoThumbFileId = isVideo
    ? (message.data as { thumbnailFileId?: string } | undefined)
        ?.thumbnailFileId ?? ''
    : '';

  const creator = message.creator;
  const avatarUrl = useFile({ fileId: creator?.avatarFileId ?? '' });
  const imageThumb = useFile({
    fileId: imageFileId,
    imageSize: ImageSizeState.small,
  });
  const videoThumb = useFile({
    fileId: videoThumbFileId,
    imageSize: ImageSizeState.small,
  });
  const mediaThumb = isImage ? imageThumb : isVideo ? videoThumb : undefined;

  return (
    <Pressable
      style={styles.notification}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.left}>
        {creator ? (
          <Avatar.User
            avatarUrl={avatarUrl}
            displayName={creator.displayName}
            size="sm"
          />
        ) : null}
        <Typography variant="body" style={styles.preview} numberOfLines={1}>
          {getPreviewText(message)}
        </Typography>
      </View>
      <View style={styles.right}>
        {isImage || isVideo ? (
          <View style={styles.thumb}>
            {mediaThumb ? (
              <Image source={{ uri: mediaThumb }} style={styles.thumbImg} />
            ) : (
              <AmityIcon
                name="image-r"
                size={18}
                tokenColor={AmityColorToken.IconMediaImageBroken}
              />
            )}
          </View>
        ) : null}
        <View style={styles.arrow}>
          <AmityIcon
            name="arrow-up-r"
            size={10}
            tokenColor={AmityColorToken.TextCustomToastDefault}
          />
        </View>
      </View>
    </Pressable>
  );
}
