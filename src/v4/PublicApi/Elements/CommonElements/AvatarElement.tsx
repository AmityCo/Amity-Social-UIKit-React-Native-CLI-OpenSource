import { Image, ImageProps } from 'react-native';
import React, { FC, useLayoutEffect, useMemo, useState } from 'react';
import {
  defaultAvatarUri,
  defaultCommunityAvatarUri,
} from '../../../../core/assets';
import { useFile } from '../../../../social/hooks';
import { ImageSizeState } from '../../../enum';
import { ComponentID, ElementID, PageID } from '../../../enum/enumUIKitID';
import useConfig from '../../../../social/hooks/useConfig';
import useAuth from '../../../../core/hooks/useAuth';

type AvatarElementType = Partial<ImageProps> & {
  avatarId: string;
  pageID?: PageID;
  componentID?: ComponentID;
  elementID: ElementID;
  targetType?: 'community' | 'user';
  // to bypass the default avatar
  defaultAvatar?: string;
  avatarCustomUrl?: string;
};

const AvatarElement: FC<AvatarElementType> = ({
  avatarId,
  pageID = '*',
  componentID = '*',
  elementID,
  targetType,
  defaultAvatar,
  avatarCustomUrl,

  ...props
}) => {
  const { client } = useAuth();
  const fallbackAvatar = useMemo(() => {
    if (defaultAvatar) return defaultAvatar;
    return targetType === 'community'
      ? defaultCommunityAvatarUri
      : defaultAvatarUri;
  }, [defaultAvatar, targetType]);
  const [avatarUrl, setAvatarUrl] = useState<string>(fallbackAvatar);
  const { excludes } = useConfig();
  const configId = `${pageID}/${componentID}/${elementID}`;
  const { getImage } = useFile();

  useLayoutEffect(() => {
    const loadAvatar = async () => {
      if (avatarCustomUrl) {
        setAvatarUrl(avatarCustomUrl);
        return;
      }

      if (!avatarId) {
        setAvatarUrl(fallbackAvatar);
        return;
      }

      const avatar = await getImage({
        fileId: avatarId,
        imageSize: ImageSizeState.small,
      });

      setAvatarUrl(avatar ?? fallbackAvatar);
    };

    loadAvatar();
  }, [avatarId, fallbackAvatar, getImage, avatarCustomUrl]);

  if (excludes.includes(configId)) return null;

  return (
    <Image
      testID={configId}
      accessibilityLabel={configId}
      source={{
        uri: avatarUrl,
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
