import { Image, ImageProps, View, Text } from 'react-native';
import { FC, useLayoutEffect, useMemo, useState } from 'react';
import {
  defaultAvatarUri,
  defaultCommunityAvatarUri,
} from '../../../core/assets';
import { useFile } from '../../hooks';
import { ImageSizeState } from '../../enums';
import { ComponentID, ElementID, PageID } from '../../enums/enumUIKitID';
import useConfig from '../../hooks/useConfig';
import useAuth from '../../../core/hooks/useAuth';
import { useStyles } from './styles';

type AvatarElementType = Partial<ImageProps> & {
  avatarId: string;
  pageID?: PageID;
  componentID?: ComponentID;
  elementID: ElementID;
  targetType?: 'community' | 'user';
  // to bypass the default avatar
  defaultAvatar?: string;
  avatarCustomUrl?: string;
  displayName?: string;
};

const AvatarElement: FC<AvatarElementType> = ({
  avatarId,
  pageID = '*',
  componentID = '*',
  elementID,
  targetType,
  defaultAvatar,
  avatarCustomUrl,
  displayName,
  ...props
}) => {
  const { client } = useAuth();
  const { styles } = useStyles();
  const fallbackAvatar = useMemo(() => {
    if (defaultAvatar) return defaultAvatar;
    return targetType === 'community'
      ? defaultCommunityAvatarUri
      : defaultAvatarUri;
  }, [defaultAvatar, targetType]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { excludes } = useConfig();
  const configId = `${pageID}/${componentID}/${elementID}`;
  const { getImage } = useFile();

  useLayoutEffect(() => {
    const loadAvatar = async () => {
      if (avatarCustomUrl) {
        setAvatarUrl(avatarCustomUrl);
        setLoaded(true);
        return;
      }

      if (!avatarId) {
        setAvatarUrl(null);
        setLoaded(true);
        return;
      }

      const avatar = await getImage({
        fileId: avatarId,
        imageSize: ImageSizeState.small,
      });

      setAvatarUrl(avatar ?? null);
      setLoaded(true);
    };

    loadAvatar();
  }, [avatarId, fallbackAvatar, getImage, avatarCustomUrl]);

  if (excludes.includes(configId)) return null;

  // Show first-char placeholder for user avatars when no image is available
  const firstChar =
    targetType === 'user' && displayName
      ? displayName.trim().charAt(0).toUpperCase()
      : null;

  if (loaded && !avatarUrl && firstChar) {
    const style = props.style as
      | { width?: number; height?: number; borderRadius?: number }
      | undefined;
    const size = style?.width ?? 40;
    const radius = style?.borderRadius ?? size / 2;
    return (
      <View
        testID={configId}
        accessibilityLabel={configId}
        style={[
          props.style,
          styles.avatarPlaceholder,
          { width: size, height: size, borderRadius: radius },
        ]}
      >
        <Text style={styles.avatarPlaceholderText}>{firstChar}</Text>
      </View>
    );
  }

  return (
    <Image
      testID={configId}
      accessibilityLabel={configId}
      source={{
        uri: avatarUrl ?? fallbackAvatar,
        headers: {
          Authorization: `Bearer ${
            (client as Amity.Client)?.token?.accessToken
          }`,
        },
      }}
      {...props}
    />
  );
};

export default AvatarElement;
