import { Image, ImageProps, View, Text } from 'react-native';
import { FC, memo, useEffect, useState } from 'react';
import useAuth from '../../../core/hooks/useAuth';
import { useFile } from '../../hooks';
import { UserRepository } from '@amityco/ts-sdk-react-native';
import { ImageSizeState } from '../../enums';
import { useStyles } from './styles';

type MyAvatarProp = Partial<ImageProps>;

const MyAvatar: FC<MyAvatarProp> = (props) => {
  const { client } = useAuth();
  const { getImage } = useFile();
  const { styles } = useStyles();
  const myId = (client as Amity.Client).userId;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    UserRepository.getUser(myId, async ({ data, loading, error }) => {
      if (loading || error || !data) return;

      setDisplayName(data.displayName ?? data.userId ?? '');

      if (data.avatarCustomUrl) {
        setAvatarUrl(data.avatarCustomUrl);
        return;
      }

      const avatar = await getImage({
        fileId: data.avatarFileId,
        imageSize: ImageSizeState.small,
      });

      setAvatarUrl(avatar ?? null);
    });
  }, [getImage, myId]);

  const style = props.style as { width?: number; height?: number } | undefined;
  const size = style?.width ?? 32;

  if (!avatarUrl) {
    const firstChar = displayName.trim().charAt(0).toUpperCase();
    if (firstChar) {
      return (
        <View
          style={[
            styles.avatarPlaceholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={styles.avatarPlaceholderText}>{firstChar}</Text>
        </View>
      );
    }
    // displayName not yet loaded — render nothing (avoids flash of default PNG)
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  return <Image source={{ uri: avatarUrl }} style={styles.img} {...props} />;
};

export default memo(MyAvatar);
