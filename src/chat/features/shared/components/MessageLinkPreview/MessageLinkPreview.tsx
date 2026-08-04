// MessageLinkPreview — ported from AmityUiKitWeb features/shared/components/
// MessageLinkPreview. A horizontal URL-preview card: a 96px thumbnail beside a
// title/domain block. Web resolves metadata via a react-query hook; RN uses the
// SDK `getLinkPreviewMetadata` through the local useLinkPreview hook. Three
// states: loading (spinner + skeleton lines), failure (broken glyph + "not
// available"), ready (image or broken glyph + title/domain). Tapping opens the
// URL in the system browser.

// 1. React / RN imports
import { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

// 2. Internal imports
import { Typography } from '../../../../../core/design/components/Typography';
import { Loader } from '../../../../../core/design/atoms/Loader';
import { Skeleton } from '../../../../../core/design/components/Skeleton';
import { AmityIcon } from '../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../core/localization';
import { getHostName, useLinkPreview } from './useLinkPreview';
import { useStyles } from './styles';

// 3. Types
type MessageLinkPreviewProps = {
  url: string;
  isOwnMessage: boolean;
  style?: StyleProp<ViewStyle>;
};

// 4. Named function component
export function MessageLinkPreview({ url, style }: MessageLinkPreviewProps) {
  const { styles } = useStyles();
  const { data, isLoading, isError } = useLinkPreview(url);
  const [imageBroken, setImageBroken] = useState(false);
  const previewUnavailableTitle = useString('amity_chat_preview_not_available');
  const previewUnavailableSubtitle = useString(
    'amity_chat_bubble_link_preview_no_data'
  );

  const isPending = isLoading;
  const isAllNull =
    data != null && !data.title && !data.domain && !data.imageUrl;
  const isFailure = !isPending && (isError || isAllNull);

  const imageUrl = data?.imageUrl ?? '';
  const title = data?.title ?? '';
  const domain = data?.domain ?? '';
  const hasUsableImage = !!imageUrl && !imageBroken;

  const thumbnailStyle = [
    styles.thumbnail,
    isPending
      ? styles.thumbnailLoading
      : hasUsableImage
      ? null
      : styles.thumbnailBroken,
  ];

  return (
    <Pressable
      style={[styles.root, style]}
      disabled={isPending}
      accessibilityRole="button"
      onPress={() => Linking.openURL(url).catch(() => undefined)}
    >
      <View style={thumbnailStyle}>
        {isPending ? (
          <Loader.Upload size="medium" />
        ) : hasUsableImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.thumbnailImg}
            resizeMode="cover"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <AmityIcon
            name="image-slash-r"
            size={18}
            tokenColor={AmityColorToken.IconMediaImageBroken}
          />
        )}
      </View>

      <View style={[styles.info, isPending && styles.infoLoading]}>
        {isPending ? (
          <>
            <Skeleton width={80} height={8} borderRadius={12} />
            <Skeleton width={54} height={8} borderRadius={12} />
          </>
        ) : isFailure ? (
          <>
            <Typography
              variant="captionBold"
              style={styles.title}
              numberOfLines={3}
            >
              {previewUnavailableTitle}
            </Typography>
            <Typography
              variant="captionSmall"
              style={styles.domain}
              numberOfLines={1}
            >
              {previewUnavailableSubtitle}
            </Typography>
          </>
        ) : (
          <>
            <Typography
              variant="captionBold"
              style={styles.title}
              numberOfLines={3}
            >
              {title || domain || url}
            </Typography>
            <Typography
              variant="captionSmall"
              style={styles.domain}
              numberOfLines={1}
            >
              {domain || getHostName(url)}
            </Typography>
          </>
        )}
      </View>
    </Pressable>
  );
}
