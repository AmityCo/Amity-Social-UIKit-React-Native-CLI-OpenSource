import { useMemo, useState } from 'react';
import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { SvgXml, XmlProps } from 'react-native-svg';
import { MyMD3Theme } from '../../../core/providers/AmityUIKitProvider';
import { category } from '../../../core/assets/icons';
import { Typography } from '../../../core/components/Typography/Typography';
import { useStyles } from './styles';
import ModeratorBadge from '../../elements/ModeratorBadge';
import { isModerator } from '../../utils/permissions';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getFileUrlWithSize } from '../../utils';
import { useUser } from '../../hooks/objects/user/useUser';
import { FileRepository } from '@amityco/ts-sdk-react-native';

// Amity file URLs are served from the Amity file/upload hosts; only these can
// be rewritten by `fileUrlWithSize`. Any other URL (e.g. a host-provided
// default avatar pointing at a third-party CDN) must be used verbatim.
const isAmityFileUrl = (url: string): boolean =>
  /\.amity\.(co|io)\b/i.test(url);

type AvatarProps = {
  uri?: string;
  imageProps: Omit<ImageProps, 'source'>;
  iconProps?: XmlProps;
  userAvatarProps?: {
    userName?: string;
    userId?: string;
    style?: StyleProp<ImageStyle>;
    roles?: string[];
    shouldRedirectToUserProfile?: boolean;
    viewable?: boolean;
    firstCharFontSize?: number;
  };
};

function Avatar({ uri, imageProps, iconProps, userAvatarProps }: AvatarProps) {
  const { styles } = useStyles();
  const [imageError, setImageError] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    if (userAvatarProps?.viewable && uri) {
      const largeUri = getFileUrlWithSize(uri, 'large');
      navigation.navigate('ImageViewer', { images: [{ uri: largeUri }] });
    } else if (userAvatarProps?.shouldRedirectToUserProfile) {
      navigation.navigate('UserProfile', { userId: userAvatarProps?.userId });
    }
  };

  return uri && !imageError ? (
    <>
      <TouchableOpacity
        style={imageProps.style}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <Image
          source={{ uri }}
          {...imageProps}
          onError={() => setImageError(true)}
        />
        {userAvatarProps?.roles && isModerator(userAvatarProps?.roles) && (
          <ModeratorBadge style={styles.moderatorBadge} />
        )}
      </TouchableOpacity>
    </>
  ) : iconProps ? (
    <SvgXml {...iconProps} />
  ) : (
    <TouchableOpacity
      style={[styles.defaultUserAvatar, userAvatarProps?.style]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Typography.Body
        style={[
          styles.firstChar,
          userAvatarProps?.firstCharFontSize
            ? { fontSize: userAvatarProps.firstCharFontSize }
            : undefined,
        ]}
      >
        {userAvatarProps.userName?.trim()?.charAt(0).toUpperCase()}
      </Typography.Body>
      {userAvatarProps?.roles && isModerator(userAvatarProps.roles) && (
        <ModeratorBadge style={styles.moderatorBadge} />
      )}
    </TouchableOpacity>
  );
}

type CategoryAvatarProps = {
  uri?: string;
  imageStyle?: StyleProp<ImageStyle>;
  iconProps?: Pick<XmlProps, 'width' | 'height'>;
};

function CategoryAvatar({
  uri,
  imageStyle,
  iconProps: $iconProps,
}: CategoryAvatarProps) {
  const theme = useTheme<MyMD3Theme>();
  return (
    <Avatar
      uri={uri}
      imageProps={{
        style: imageStyle,
        accessibilityLabel: 'Category Avatar',
      }}
      iconProps={{
        xml: category(),
        color: theme.colors.primaryShade2,
        ...$iconProps,
      }}
    />
  );
}

type UserAvatarProps = {
  uri?: string;
  userId?: string;
  roles?: string[];
  userName?: string;
  viewable?: boolean;
  imageStyle?: StyleProp<ImageStyle>;
  shouldRedirectToUserProfile?: boolean;
  firstCharFontSize?: number;
};

function UserAvatar({
  uri,
  roles,
  userId,
  userName,
  viewable,
  imageStyle,
  shouldRedirectToUserProfile,
  firstCharFontSize,
}: UserAvatarProps) {
  const { user } = useUser({ userId: userId ?? '', enabled: !!userId });

  const resolvedUri = useMemo(() => {
    const url = uri ?? user?.avatarCustomUrl ?? user?.avatar?.fileUrl;
    if (!url) return undefined;
    // `fileUrlWithSize` rewrites Amity file URLs to request a sized variant.
    // It mangles arbitrary external URLs (e.g. a host-provided default avatar),
    // so only apply it to Amity file URLs and pass any other URL through as-is.
    return isAmityFileUrl(url)
      ? FileRepository.fileUrlWithSize(url, 'small')
      : url;
  }, [uri, user?.avatarCustomUrl, user?.avatar?.fileUrl]);

  const resolvedName = userName ?? user?.displayName ?? user?.userId;

  return (
    <Avatar
      uri={resolvedUri}
      userAvatarProps={{
        roles,
        userId,
        userName: resolvedName,
        style: imageStyle,
        shouldRedirectToUserProfile,
        viewable: viewable,
        firstCharFontSize,
      }}
      imageProps={{
        style: imageStyle,
        accessibilityLabel: `${resolvedName ?? 'User'} Avatar`,
      }}
    />
  );
}

Avatar.Category = CategoryAvatar;

Avatar.User = UserAvatar;

export default Avatar;
