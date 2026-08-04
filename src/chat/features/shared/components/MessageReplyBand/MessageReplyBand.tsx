// MessageReplyBand — ported from AmityUiKitWeb features/shared/components/
// MessageReplyBand. The "Replying to X" band shown above the composer while
// composing a reply. Tapping the band opens the parent (see-more / image /
// video); the trailing close button cancels the reply. Web tracked live
// deletion via useMessageObject; RN has no such hook, so deletion is read from
// replyTo.isDeleted (the wiring layer supplies a fresh message).

// 1. React / RN imports
import { Image, Pressable, View } from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import useFile from '../../../../../core/hooks/useFile';
import { ImageSizeState } from '../../../../../core/enums';
import { useString } from '../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type MessageReplyBandProps = {
  replyTo: Amity.Message;
  currentUserId?: string | null;
  onCancel: () => void;
  onOpenSeeMore: (text: string, title?: string) => void;
  onOpenImage: (url: string, message: Amity.Message) => void;
  onOpenVideo: (message: Amity.Message) => void;
};

type MessageData = {
  text?: string;
  fileId?: string;
  thumbnailFileId?: string;
};

// 4. Named function component
export function MessageReplyBand({
  replyTo,
  currentUserId,
  onCancel,
  onOpenSeeMore,
  onOpenImage,
  onOpenVideo,
}: MessageReplyBandProps) {
  const { styles } = useStyles();
  const yourselfLabel = useString('amity_chat_message_replying_yourself');
  const unknownUserLabel = useString('amity_chat_unknown_user');
  const repliedMessageTitle = useString('amity_chat_message_replied_message');
  const replyingToLabel = useString('amity_chat_replying_to');

  const isParentDeleted = !!replyTo.isDeleted;
  const isToYourself = replyTo.creatorId === currentUserId;
  const creatorName = (
    replyTo as unknown as { creator?: { displayName?: string } }
  ).creator?.displayName;
  const replyName = isToYourself
    ? yourselfLabel
    : creatorName ?? unknownUserLabel;

  function handleBandPress() {
    if (isParentDeleted) return;
    const data = replyTo.data as MessageData | undefined;
    if (replyTo.dataType === 'text') {
      onOpenSeeMore((data?.text ?? '').toString(), repliedMessageTitle);
      return;
    }
    if (replyTo.dataType === 'image') {
      onOpenImage('', replyTo);
      return;
    }
    if (replyTo.dataType === 'video') {
      onOpenVideo(replyTo);
    }
  }

  return (
    <Pressable
      style={styles.band}
      onPress={handleBandPress}
      disabled={isParentDeleted}
      accessibilityRole="button"
      accessibilityLabel={repliedMessageTitle}
    >
      <View style={styles.textCol}>
        <Typography
          variant="captionBold"
          style={styles.title}
          numberOfLines={1}
        >
          {replyingToLabel} {replyName}
        </Typography>
        <ReplyBandBody replyTo={replyTo} isParentDeleted={isParentDeleted} />
      </View>
      {!isParentDeleted ? <ReplyBandThumb replyTo={replyTo} /> : null}
      <Pressable
        style={styles.close}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel reply"
      >
        <AmityIcon
          name="cross-r"
          size={16}
          tokenColor={AmityColorToken.IconIconButtonGhostSecondaryDefault}
        />
      </Pressable>
    </Pressable>
  );
}

function ReplyBandBody({
  replyTo,
  isParentDeleted,
}: {
  replyTo: Amity.Message;
  isParentDeleted: boolean;
}) {
  const { styles } = useStyles();
  const unavailableLabel = useString('amity_chat_message_unavailable');
  const photoLabel = useString('amity_chat_reply_photo_label');
  const videoLabel = useString('amity_chat_reply_video_label');

  let body: string | null = null;
  if (isParentDeleted) {
    body = unavailableLabel;
  } else if (replyTo.dataType === 'text') {
    body = ((replyTo.data as MessageData | undefined)?.text ?? '').toString();
  } else if (replyTo.dataType === 'image') {
    body = photoLabel;
  } else if (replyTo.dataType === 'video') {
    body = videoLabel;
  } else if (replyTo.dataType === 'custom') {
    body = JSON.stringify(replyTo.data ?? {});
  }

  if (body == null) return null;
  return (
    <Typography variant="caption" style={styles.body} numberOfLines={1}>
      {body}
    </Typography>
  );
}

function ReplyBandThumb({ replyTo }: { replyTo: Amity.Message }) {
  const { styles } = useStyles();
  const data = replyTo.data as MessageData | undefined;
  const isVideo = replyTo.dataType === 'video';
  const thumbFileId = isVideo
    ? data?.thumbnailFileId ?? ''
    : replyTo.dataType === 'image'
    ? data?.fileId ?? ''
    : '';
  const url = useFile({ fileId: thumbFileId, imageSize: ImageSizeState.small });

  if (!url || (!isVideo && replyTo.dataType !== 'image')) return null;

  return (
    <View style={styles.thumbWrap}>
      <Image source={{ uri: url }} style={styles.thumbImg} resizeMode="cover" />
      {isVideo ? (
        <View style={styles.playChip}>
          <View style={styles.playChipInner}>
            <AmityIcon
              name="circle-play-s"
              size={16}
              tokenColor={
                AmityColorToken.IconIconButtonTransparentPrimaryDefault
              }
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
