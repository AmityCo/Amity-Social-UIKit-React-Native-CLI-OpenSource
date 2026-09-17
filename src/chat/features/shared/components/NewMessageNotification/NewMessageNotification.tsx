// NewMessageNotification — a floating pill pinned to the bottom of the message
// list showing the latest incoming message (avatar + preview text + optional
// media thumbnail) that scrolls to it on press.
//
// The image thumb goes through `useFile`, which already returns a size-scaled
// URL, so it asks for 'small' directly; the avatar/image calls stay
// unconditional (passing '') to respect rules-of-hooks. A missing or broken
// thumb falls back to the media-broken icon. The video thumb is the video's own
// first frame, painted by a paused <Video> (see below) — there is no separate
// thumbnail file to load.
//
// The drop shadow the design gives the pill is omitted: it would need a raw hex,
// which this repo does not allow outside the token set.

// 1. React / RN imports
import { useRef } from 'react';
import { Pressable, View, Image } from 'react-native';

// 2. Third-party imports
import Video, { type VideoRef } from 'react-native-video';

// 3. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { resolveString } from '../../../../../core/localization';
import useFile from '../../../../../core/hooks/useFile';
import { ImageSizeState } from '../../../../../core/enums';
import { Avatar } from '../../../../elements/Avatar';
import { useVideoFileUrl } from '../../../../hooks/useVideoFileUrl';
import { useStyles } from './styles';

// 4. Types
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

// 5. Named function component
export function NewMessageNotification({
  message,
  onPress,
}: NewMessageNotificationProps) {
  const { styles } = useStyles();

  const isImage = message.dataType === 'image';
  const isVideo = message.dataType === 'video';
  const fileId =
    (message.data as { fileId?: string } | undefined)?.fileId ?? '';

  const creator = message.creator;
  const avatarUrl = useFile({ fileId: creator?.avatarFileId ?? '' });
  const imageThumb = useFile({
    fileId: isImage ? fileId : '',
    imageSize: ImageSizeState.small,
  });
  // A video message carries no separate thumbnail file — `data.fileId` IS the
  // video — so reading a `thumbnailFileId` here always came back empty and every
  // video preview fell through to the media-broken icon. `useVideoFileUrl` is the
  // raw-url hook that feeds react-native-video everywhere else in chat.
  const videoUrl = useVideoFileUrl(isVideo ? fileId : undefined);

  // react-native-video 6 paints no frame while `paused` until playback or a
  // seek, so the poster is nudged off frame 0 exactly once — the same treatment
  // the video bubble gives its poster.
  const posterRef = useRef<VideoRef | null>(null);
  const seededPoster = useRef(false);

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
            size="xs"
          />
        ) : null}
        <Typography variant="body" style={styles.preview} numberOfLines={1}>
          {getPreviewText(message)}
        </Typography>
      </View>
      <View style={styles.right}>
        {isImage || isVideo ? (
          <View style={styles.thumb}>
            {isVideo && videoUrl ? (
              <Video
                ref={posterRef}
                source={{ uri: videoUrl }}
                style={styles.thumbImg}
                resizeMode="cover"
                paused
                muted
                controls={false}
                onLoad={() => {
                  if (seededPoster.current) return;
                  seededPoster.current = true;
                  posterRef.current?.seek(0.1);
                }}
              />
            ) : isImage && imageThumb ? (
              <Image source={{ uri: imageThumb }} style={styles.thumbImg} />
            ) : (
              <AmityIcon
                name="image-r"
                size={18}
                tokenColor={AmityColorToken.IconMediaImageBroken}
              />
            )}
            {isVideo ? (
              <View style={styles.playBadge} pointerEvents="none">
                <AmityIcon
                  name="video-play-s"
                  size={16}
                  tokenColor={
                    AmityColorToken.IconIconButtonTransparentPrimaryDefault
                  }
                />
              </View>
            ) : null}
          </View>
        ) : null}
        <AmityIcon
          name="chevron-down"
          size={28}
          tokenColor={AmityColorToken.IconIconButtonGhostSecondaryDefault}
        />
      </View>
    </Pressable>
  );
}
